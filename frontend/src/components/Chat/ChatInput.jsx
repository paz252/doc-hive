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
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        p: 1,
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={6}
        placeholder={
          streaming
            ? "DocHive is thinking..."
            : "Ask something about this document..."
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