import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL = "https://dochive-backend.onrender.com";

export default function useChat(documentIds = []) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const documentIdsRef = useRef(documentIds);

  useEffect(() => {
    documentIdsRef.current = documentIds;
  }, [documentIds]);

  const sendMessage = useCallback(
    async (query) => {
      const trimmedQuery = query?.trim();

      if (!trimmedQuery || isLoading) {
        return;
      }

      setError(null);
      setIsLoading(true);

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedQuery,
        timestamp: Date.now(),
      };

      const assistantMessageId = crypto.randomUUID();

      const assistantMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: Date.now(),
      };

      setMessages((previous) => [
        ...previous,
        userMessage,
        assistantMessage,
      ]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Throttle re-renders: buffer incoming text and flush once per
      // animation frame instead of on every chunk. Prevents ReactMarkdown
      // (or even plain text state updates) from re-rendering hundreds of
      // times per response.
      let pendingText = "";
      let frameHandle = null;

      const flush = () => {
        frameHandle = null;
        if (!pendingText) return;

        const textToAppend = pendingText;
        pendingText = "";

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: message.content + textToAppend }
              : message
          )
        );
      };

      const appendToAssistantMessage = (chunk) => {
        pendingText += chunk;
        if (frameHandle == null) {
          frameHandle = requestAnimationFrame(flush);
        }
      };

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/chat/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
            },
            body: JSON.stringify({
              engine: "DOCHIVE",
              documentIds: [...documentIdsRef.current],
              query: trimmedQuery,
            }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          let message = `Chat request failed (${response.status})`;

          try {
            const errorBody = await response.json();
            message = errorBody?.message || errorBody?.error || message;
          } catch {
            // Response wasn't JSON.
          }

          throw new Error(message);
        }

        if (!response.body) {
          throw new Error(
            "The server did not return a streaming response."
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events are delimited by a BLANK LINE ("\n\n"), not a
          // single "\n". Splitting on "\n" alone breaks apart multi-line
          // data payloads that belong to the same event.
          const events = buffer.split("\n\n");
          buffer = events.pop() || ""; // last part may be incomplete

          for (const event of events) {
            const lines = event.split("\n");

            const dataLines = lines
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).replace(/^ /, ""));

            if (dataLines.length === 0) continue;

            const rawData = dataLines.join("\n");
            if (!rawData || rawData === "[DONE]") continue;

            let chunk;
            try {
              // Backend now sends JSON-encoded strings, so real newlines arrive
              // as escaped "\n" within one line and need to be decoded back.
              chunk = JSON.parse(rawData);
            } catch {
              // Fallback in case any non-JSON event slips through
              chunk = rawData;
            }

            appendToAssistantMessage(chunk);
          }
        }

        // Flush any remaining buffered (incomplete) event on stream end
        if (buffer.startsWith("data:") || buffer.includes("\ndata:")) {
          const lines = buffer.split("\n");
          const dataLines = lines
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).replace(/^ /, ""));

          const chunk = dataLines.join("\n");
          if (chunk && chunk !== "[DONE]") {
            appendToAssistantMessage(chunk);
          }
        }

        // Ensure the last buffered frame is flushed before marking done
        if (frameHandle != null) {
          cancelAnimationFrame(frameHandle);
        }
        flush();
      } catch (err) {
        if (frameHandle != null) {
          cancelAnimationFrame(frameHandle);
        }

        if (err?.name === "AbortError" || controller.signal.aborted) {
          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantMessageId
                ? { ...message, isStreaming: false }
                : message
            )
          );
          return;
        }

        console.error("DocHive chat request failed:", err);

        setError(
          err?.message || "Unable to get a response from DocHive."
        );

        setMessages((previous) =>
          previous.filter(
            (message) =>
              message.id !== assistantMessageId ||
              message.content.length > 0
          )
        );
      } finally {
        // Mark streaming complete so the UI can swap from plain text
        // to rendered markdown.
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessageId
              ? { ...message, isStreaming: false }
              : message
          )
        );

        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [isLoading]
  );

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const stopGeneration = useCallback(() => {
    if (!abortControllerRef.current) {
      return;
    }

    abortControllerRef.current.abort();
    abortControllerRef.current = null;

    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
  };
}