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
        timestamp: Date.now(),
      };

      setMessages((previous) => [
        ...previous,
        userMessage,
        assistantMessage,
      ]);

      const controller = new AbortController();

      abortControllerRef.current = controller;

      const appendToAssistantMessage = (chunk) => {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: message.content + chunk }
              : message
          )
        );
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

          // SSE lines are newline-delimited
          const lines = buffer.split("\n");
          buffer = lines.pop(); // last part may be incomplete, keep for next read

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            // Strip ONLY the "data:" prefix — keep any leading space, it's meaningful content
            const chunk = line.slice(5);

            if (chunk === "[DONE]") continue;

            appendToAssistantMessage(chunk);
          }
        }

        // flush any remaining buffered line without a trailing newline
        if (buffer.startsWith("data:")) {
          const chunk = buffer.slice(5);
          if (chunk && chunk !== "[DONE]") {
            appendToAssistantMessage(chunk);
          }
        }
      } catch (err) {
        if (err?.name === "AbortError" || controller.signal.aborted) {
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