import {
  Avatar,
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import "./Chat.css";

export default function MessageBubble({
  message,
}) {
  const isUser = message.role === "user";

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
          maxWidth: "75%",
        }}
      >
        {!isUser && (
          <Avatar
            sx={{
              width: 26,
              height: 26,
              bgcolor: "primary.main",
              flexShrink: 0,
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Avatar>
        )}

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
            borderRadius: 1.5,
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

        {isUser && (
          <Avatar
            sx={{
              width: 26,
              height: 26,
              flexShrink: 0,
            }}
          >
            <PersonIcon fontSize="small" />
          </Avatar>
        )}
      </Stack>
    </Box>
  );
}