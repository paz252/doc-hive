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
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent={
        isUser ? "flex-end" : "flex-start"
      }
      sx={{ width: "100%" }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
          }}
        >
          <AutoAwesomeIcon fontSize="small" />
        </Avatar>
      )}

      <Paper
        elevation={0}
        sx={{
          maxWidth: "75%",
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
          borderRadius: 2,
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
            width: 32,
            height: 32,
          }}
        >
          <PersonIcon fontSize="small" />
        </Avatar>
      )}
    </Stack>
  );
}