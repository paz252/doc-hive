import {
  Box,
  Stack,
} from "@mui/material";

import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        px: 3,
        py: 3,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          maxWidth: 900,
          mx: "auto",
        }}
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

        <div ref={bottomRef} />
      </Stack>
    </Box>
  );
}