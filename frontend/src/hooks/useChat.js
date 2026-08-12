import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL = "https://dochive-backend.onrender.com";

export default function useChat(documentIds = []) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const documentIdsRef = useRef(documentIds);

  /*
   * Keep the latest document context available
   * without recreating sendMessage whenever the
   * sidebar selection changes.
   */
  useEffect(() => {
    documentIdsRef.current = documentIds;
  }, [documentIds]);

  /*
   * Send a query to the DocHive SSE endpoint.
   */
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

      try {
        /*
         * IMPORTANT:
         *
         * documentIds = []
         * means ALL documents to the backend.
         */
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
              documentIds: [
                ...documentIdsRef.current,
              ],
              query: trimmedQuery,
            }),

            signal: controller.signal,
          }
        );

        if (!response.ok) {
          let message =
            `Chat request failed (${response.status})`;

          try {
            const errorBody =
              await response.json();

            message =
              errorBody?.message ||
              errorBody?.error ||
              message;
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

        const reader =
          response.body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
          const { value, done } =
            await reader.read();

          if (done) {
            break;
          }

          /*
           * Decode the incoming byte chunk.
           */
          buffer += decoder.decode(value, {
            stream: true,
          });

          /*
           * SSE events are separated by a blank line.
           *
           * Example:
           *
           * data: Hello
           *
           * data: world
           *
           */
          const events = buffer.split(
            /\r?\n\r?\n/
          );

          /*
           * The final element may be an incomplete
           * SSE event. Keep it for the next chunk.
           */
          buffer = events.pop() || "";

          for (const event of events) {
            processSseEvent(
              event,
              assistantMessageId,
              setMessages
            );
          }
        }

        /*
         * Flush any remaining decoder data.
         */
        buffer += decoder.decode();

        if (buffer.trim()) {
          processSseEvent(
            buffer,
            assistantMessageId,
            setMessages
          );
        }
      } catch (err) {
        /*
         * AbortController cancellation is expected
         * when the user presses Stop.
         */
        if (
          err?.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error(
          "DocHive chat request failed:",
          err
        );

        setError(
          err?.message ||
            "Unable to get a response from DocHive."
        );

        /*
         * Remove the empty assistant message if
         * the request failed before any response
         * was received.
         */
        setMessages((previous) =>
          previous.filter(
            (message) =>
              message.id !== assistantMessageId ||
              message.content.length > 0
          )
        );
      } finally {
        if (
          abortControllerRef.current === controller
        ) {
          abortControllerRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [isLoading]
  );

  /*
   * Clear the entire conversation.
   */
  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  /*
   * Stop the currently running AI response.
   *
   * Already received content remains in the chat.
   */
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

/*
 * Process one complete SSE event.
 *
 * Example:
 *
 * data: Hello
 *
 * or:
 *
 * data: {"content":"Hello"}
 *
 * Spring's SSE response may contain either
 * plain text or JSON depending on the controller.
 */
function processSseEvent(
  event,
  assistantMessageId,
  setMessages
) {
  if (!event?.trim()) {
    return;
  }

  const dataLines = event
    .split(/\r?\n/)
    .filter((line) =>
      line.startsWith("data:")
    )
    .map((line) =>
      line.substring(5).trimStart()
    );

  if (dataLines.length === 0) {
    return;
  }

  const data = dataLines.join("\n");

  if (!data || data === "[DONE]") {
    return;
  }

  const content = extractContent(data);

  if (!content) {
    return;
  }

  setMessages((previous) =>
    previous.map((message) =>
      message.id === assistantMessageId
        ? {
            ...message,
            content:
              message.content + content,
          }
        : message
    )
  );
}

/*
 * Supports several possible SSE payload formats:
 *
 * 1. data: Hello
 *
 * 2. data: {"content":"Hello"}
 *
 * 3. data: {"response":"Hello"}
 *
 * 4. data: {"text":"Hello"}
 */
function extractContent(data) {
  try {
    const parsed = JSON.parse(data);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (typeof parsed?.content === "string") {
      return parsed.content;
    }

    if (typeof parsed?.response === "string") {
      return parsed.response;
    }

    if (typeof parsed?.text === "string") {
      return parsed.text;
    }

    return "";
  } catch {
    /*
     * Not JSON — treat it as plain SSE text.
     */
    return data;
  }
}