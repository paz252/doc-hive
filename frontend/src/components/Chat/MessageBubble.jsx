import { useState } from "react";

import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import "./Chat.css";

export default function MessageBubble({
  message,
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const formattedTime = new Date(
    message.timestamp || Date.now()
  ).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const handleCopy = async () => {
    if (!message.content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        justifyContent: isUser
          ? "flex-end"
          : "flex-start",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          maxWidth: { xs: "88%", sm: "75%" },
          alignItems: "flex-start",
          ":hover .message-meta": {
            opacity: 1,
            transform: "translateY(0)",
          },
        }}
      >

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.25,
              border: 1,
              borderColor: isUser
                ? "primary.main"
                : "divider",
              backgroundColor: isUser
                ? "primary.main"
                : "background.paper",
              color: isUser
                ? "primary.contrastText"
                : "text.primary",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {message.content}
              {!isUser &&
                message.content === "" && (
                  <span className="typing-indicator">
                    ●●●
                  </span>
                )}
            </Typography>
          </Paper>

          <Stack
            className="message-meta"
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              mt: 0.5,
              opacity: 0,
              transform: "translateY(4px)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              pointerEvents: "none",
              "& .MuiIconButton-root, & .MuiTypography-root": {
                pointerEvents: "auto",
              },
            }}
          >
            {isUser ? (
              <>
                <Typography
                  variant="caption"
                  sx={(theme) => ({
                    color: theme.palette.text.secondary,
                    fontSize: "0.68rem",
                    lineHeight: 1.2,
                  })}
                >
                  {formattedTime}
                </Typography>

                <Tooltip title={copied ? "Copied" : "Copy message"}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 0,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={handleCopy}
                      disabled={!message.content}
                      sx={{
                        p: 0.2,
                        color: "text.secondary",
                        ".MuiSvgIcon-root": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {copied ? (
                        <CheckIcon fontSize="small" />
                      ) : (
                        <ContentCopyIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={copied ? "Copied" : "Copy message"}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 0,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={handleCopy}
                      disabled={!message.content}
                      sx={{
                        p: 0.2,
                        color: "text.secondary",
                        ".MuiSvgIcon-root": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {copied ? (
                        <CheckIcon fontSize="small" />
                      ) : (
                        <ContentCopyIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>

                <Typography
                  variant="caption"
                  sx={(theme) => ({
                    color: theme.palette.text.secondary,
                    fontSize: "0.68rem",
                    lineHeight: 1.2,
                  })}
                >
                  {formattedTime}
                </Typography>
              </>
            )}
          </Stack>
        </Box>

      </Stack>
    </Box>
  );
}
