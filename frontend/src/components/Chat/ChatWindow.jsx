import { Box } from "@mui/material";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ChatEmptyState from "./ChatEmptyState";

import useChat from "../../hooks/useChat";

export default function ChatWindow({
  documentIds,
  documents,
  selectedDocuments,
  allDocumentsSelected,
  onContextChange,
}) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
  } = useChat(documentIds);

  const handleSend = async (message) => {
    const query = message?.trim();

    if (!query || isLoading) {
      return;
    }

    await sendMessage(query);
  };

  const handleSuggestion = (prompt) => {
    handleSend(prompt);
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <ChatHeader
          documents={documents}
          allDocumentsSelected={
            allDocumentsSelected
          }
          selectedDocuments={selectedDocuments}
          hasMessages={messages.length > 0}
          onClearChat={clearChat}
          onContextChange={onContextChange}
        />
      </Box>

      {/* Chat content */}
      <Box
        sx={(theme) => ({
          flex: 1,
          minHeight: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette.surface.chatWindow,
          overflowY: "auto",

          scrollbarWidth: "thin",
          scrollbarColor:
            theme.palette.mode === "dark"
              ? `${theme.palette.grey[800]} transparent`
              : `${theme.palette.grey[400]} transparent`,

          "&::-webkit-scrollbar": {
            width: 6,
          },

          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[600]
                : theme.palette.grey[500],
            borderRadius: 999,
          },
        })}
      >
        <Box
          sx={{
            width: "75%",
            mx: "auto",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.length === 0 ? (
            <ChatEmptyState
              onPrompt={handleSuggestion}
            />
          ) : (
            <MessageList
              messages={messages}
              isLoading={isLoading}
            />
          )}

          {error && (
            <Box
              sx={{
                flexShrink: 0,
                pb: 1,
                color: "error.main",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </Box>
          )}
        </Box>
      </Box>

      {/* Prompt input */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <ChatInput
          streaming={isLoading}
          onSend={handleSend}
          onStop={stopGeneration}
        />
      </Box>
    </Box>
  );
}
