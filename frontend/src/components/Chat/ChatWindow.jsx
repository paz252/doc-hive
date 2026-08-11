import { Box } from "@mui/material";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ChatEmptyState from "./ChatEmptyState";

import useChat from "../../hooks/useChat";

export default function ChatWindow({
  documentIds,
  selectedDocuments,
  allDocumentsSelected,
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
      sx={(theme) => ({
        height: "100%",
        width: "100%",
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: theme.palette.surface.chatWindow,
      })}
    >
      <Box sx={{ flexShrink: 0 }}>
        <ChatHeader
          allDocumentsSelected={
            allDocumentsSelected
          }
          selectedDocuments={selectedDocuments}
          hasMessages={messages.length > 0}
          onClearChat={clearChat}
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
              px: 3,
              pb: 1,
              color: "error.main",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </Box>
        )}
      </Box>

      {/* Prompt input */}
      <Box
        sx={(theme) => ({
          flexShrink: 0,
          px: 3,
          py: 2,
          border: "none",
          backgroundColor: theme.palette.surface.chatInputBox,
          display: "flex",
          justifyContent: "center",
        })}
      >
        <Box
          sx={(theme) => ({
            width: "100%",
            maxWidth: 760,
            backgroundColor: theme.palette.surface.chatInput,
            borderRadius: 1.5,
            p: 0.25,
          })}
        >
          <ChatInput
            streaming={isLoading}
            onSend={handleSend}
            onStop={stopGeneration}
            filename={
              allDocumentsSelected
                ? "all documents"
                : selectedDocuments.length > 0
                  ? selectedDocuments[0]?.fileName || "this document"
                  : "this document"
            }
          />
        </Box>
      </Box>
    </Box>
  );
}