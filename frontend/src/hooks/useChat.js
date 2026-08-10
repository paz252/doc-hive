import {
  useCallback,
  useRef,
  useState,
} from "react";

import { streamChat } from "../api/chatApi";

export default function useChat(documentId) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] =
    useState(false);
  const [error, setError] = useState(null);

  const abortController = useRef(null);

  const sendMessage = useCallback(
    async (query) => {
      if (!documentId || !query.trim() || streaming) {
        return;
      }

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: query.trim(),
      };

      const assistantId = crypto.randomUUID();

      setMessages((current) => [
        ...current,
        userMessage,
        {
          id: assistantId,
          role: "assistant",
          content: "",
        },
      ]);

      setStreaming(true);
      setError(null);

      abortController.current =
        new AbortController();

      try {
        await streamChat({
          documentId,
          query: query.trim(),
          signal: abortController.current
            .signal,

          onChunk: (chunk) => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content:
                        message.content +
                        chunk,
                    }
                  : message
              )
            );
          },
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "Unable to generate a response."
          );

          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content:
                      "Sorry, I couldn't generate a response.",
                  }
                : message
            )
          );
        }
      } finally {
        setStreaming(false);
        abortController.current = null;
      }
    },
    [documentId, streaming]
  );

  const stopStreaming = useCallback(() => {
    abortController.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    stopStreaming();
    setMessages([]);
    setError(null);
  }, [stopStreaming]);

  return {
    messages,
    streaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}