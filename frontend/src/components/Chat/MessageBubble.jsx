import { useState } from "react";

import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

  const isEmpty = !isUser && message.content === "";
  // Render as markdown only once the assistant message has finished
  // streaming — avoids ReactMarkdown flickering on incomplete syntax
  // (e.g. an unclosed "**" or a half-written list item) while tokens
  // are still arriving.
  const showMarkdown = !isUser && !message.isStreaming && !isEmpty;

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
            minWidth: 0,
            width: showMarkdown ? "100%" : "auto",
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
              minWidth: 0,
            }}
          >
            {isEmpty ? (
              <Typography variant="body1">
                <span className="typing-indicator">●●●</span>
              </Typography>
            ) : showMarkdown ? (
              <Box
                className="markdown-content"
                sx={{
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  overflowWrap: "anywhere",
                  "& > *:first-of-type": { marginTop: 0 },
                  "& > *:last-child": { marginBottom: 0 },
                  "& p": { margin: "0 0 0.75em" },
                  "& ul, & ol": {
                    margin: "0 0 0.75em",
                    paddingLeft: "1.4em",
                  },
                  "& li": { marginBottom: "0.25em" },
                  "& li > p": { margin: 0 },
                  "& h1, & h2, & h3, & h4": {
                    margin: "0.9em 0 0.4em",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  },
                  "& h1": { fontSize: "1.25rem" },
                  "& h2": { fontSize: "1.15rem" },
                  "& h3": { fontSize: "1.05rem" },
                  "& code": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.06)",
                    borderRadius: 0.5,
                    px: 0.5,
                    py: 0.1,
                    fontSize: "0.85em",
                    fontFamily: "monospace",
                  },
                  "& pre": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                    borderRadius: 1,
                    p: 1.5,
                    overflowX: "auto",
                    mb: 1,
                  },
                  "& pre code": {
                    bgcolor: "transparent",
                    p: 0,
                  },
                  "& blockquote": {
                    borderLeft: "3px solid",
                    borderColor: "divider",
                    pl: 1.5,
                    ml: 0,
                    color: "text.secondary",
                  },
                  "& table": {
                    borderCollapse: "collapse",
                    width: "100%",
                    mb: 1,
                    fontSize: "0.9em",
                  },
                  "& th, & td": {
                    border: 1,
                    borderColor: "divider",
                    px: 1,
                    py: 0.5,
                    textAlign: "left",
                  },
                  "& a": {
                    color: "primary.main",
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </Box>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {message.content}
              </Typography>
            )}
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