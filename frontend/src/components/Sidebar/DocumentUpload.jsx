import { useRef } from "react";

import {
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function DocumentUpload({
  uploading,
  onUpload,
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await onUpload(file);

    event.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
        onChange={handleChange}
      />

      <Paper
        variant="outlined"
        onClick={handleClick}
        sx={(theme) => ({
          p: 2,
          cursor: uploading ? "default" : "pointer",
          border: `1px dashed ${theme.palette.primary.main}`,
          backgroundColor: uploading
            ? theme.palette.action.disabledBackground
            : theme.palette.surface.documentItem,
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          opacity: uploading ? 0.8 : 1,
          "&:hover": {
            backgroundColor: uploading
              ? theme.palette.action.disabledBackground
              : theme.palette.action.hover,
          },
        })}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            mb: 1,
          }}
        >
          {uploading ? (
            <CircularProgress
              size={28}
              color="inherit"
            />
          ) : (
            <UploadFileIcon />
          )}
        </Box>

        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ mb: 0.1 }}
        >
          {uploading
            ? "Uploading..."
            : "Upload Files or Drag here"}
        </Typography>

        <Typography
          variant="caption"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontSize: "0.7rem",
          })}
        >
          PDF, Word, Markdown, TXT, Image (max 10MB)
        </Typography>
      </Paper>
    </>
  );
}