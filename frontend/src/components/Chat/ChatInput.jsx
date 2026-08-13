import { useState } from "react";

import {
  IconButton,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";

export default function ChatInput({
  streaming,
  onSend,
  onStop,
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const query = value.trim();

    if (!query || streaming) {
      return;
    }

    onSend(query);
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Paper
      component="form"
      elevation={0}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      sx={(theme) => ({
        display: "flex",
        alignItems: "flex-end",
        gap: 0.5,
        p: 0.75,
        border: "1px solid transparent",
        borderRadius: 1,
        backgroundColor: theme.palette.surface.chatWindow,
        // Fixed 50% left almost no room on mobile. Scale by breakpoint
        // instead, capped so it doesn't stretch too wide on large desktops.
        width: { xs: "100%", sm: "85%", md: "70%", lg: "60%" },
        maxWidth: 720,
        margin: "0 auto",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:focus-within": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}22`,
        },
      })}
    >
      <TextField
        fullWidth
        multiline
        maxRows={6}
        placeholder={
          streaming
            ? "DocHive is thinking..."
            : `Query your documents...`
        }
        value={value}
        disabled={streaming}
        onChange={(event) =>
          setValue(event.target.value)
        }
        onKeyDown={handleKeyDown}
        variant="standard"
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
      />

      <Tooltip
        title={
          streaming
            ? "Stop response"
            : "Send message"
        }
      >
        <IconButton
          color="primary"
          onClick={
            streaming
              ? onStop
              : handleSubmit
          }
          disabled={
            !streaming && !value.trim()
          }
        >
          {streaming ? (
            <StopIcon />
          ) : (
            <SendIcon />
          )}
        </IconButton>
      </Tooltip>
    </Paper>
  );
}