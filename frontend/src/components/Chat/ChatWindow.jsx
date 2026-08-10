import {
  Alert,
  Box,
} from "@mui/material";

import ChatHeader from "./ChatHeader";
import ChatEmptyState from "./ChatEmptyState";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

import useChat from "../../hooks/useChat";

export default function ChatWindow({
  document,
}) {
  const {
    messages,
    streaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
  } = useChat(document.id);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ChatHeader
        document={document}
        hasMessages={messages.length > 0}
        onClearChat={clearMessages}
      />

      {messages.length === 0 ? (
        <ChatEmptyState document={document} />
      ) : (
        <MessageList messages={messages} />
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mx: 3,
            mb: 1,
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          px: 3,
          pb: 2,
          pt: 1,
        }}
      >
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
          }}
        >
          <ChatInput
            streaming={streaming}
            onSend={sendMessage}
            onStop={stopStreaming}
          />
        </Box>
      </Box>
    </Box>
  );
}