import { useRef, useState } from "react";

import {
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export default function DocumentUpload({
  uploading,
  onUpload,
}) {
  const inputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Tracks nested dragenter/dragleave events so the
   * dashed border doesn't flicker as the pointer moves
   * over child elements (icon, text) inside the drop zone.
   */
  const dragCounter = useRef(0);

  const handleClick = () => {
    setError(null);
    inputRef.current?.click();
  };

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setError(`File is ${sizeMb}MB. Max allowed size is 2MB.`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateFile(file)) {
      event.target.value = "";
      return;
    }

    await onUpload(file);

    event.target.value = "";
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (uploading) {
      return;
    }

    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    /*
     * Required to allow dropping - browsers reject
     * drops by default unless dragover is prevented.
     */
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (uploading) {
      return;
    }

    dragCounter.current -= 1;

    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounter.current = 0;
    setIsDragging(false);

    if (uploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    await onUpload(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.csv,.xlsx,.xls"
        onChange={handleChange}
      />

      <Paper
        variant="outlined"
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={(theme) => ({
          p: 2,
          cursor: uploading ? "default" : "pointer",
          border: `1px dashed ${
            error ? theme.palette.error.main : theme.palette.primary.main
          }`,
          backgroundColor: uploading
            ? theme.palette.action.disabledBackground
            : isDragging
              ? theme.palette.action.hover
              : theme.palette.surface.documentItem,
          boxShadow: isDragging
            ? `0 0 0 2px ${theme.palette.primary.main} inset`
            : "none",
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
          sx={(theme) => ({
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: error
              ? theme.palette.error.main
              : "primary.main",
            color: error
              ? theme.palette.error.contrastText
              : "primary.contrastText",
            mb: 1,
          })}
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
          sx={(theme) => ({
            mb: 0.1,
            color: error ? theme.palette.error.main : "inherit",
          })}
        >
          {uploading
            ? "Uploading..."
            : error
              ? "Upload failed"
              : isDragging
                ? "Drop to upload"
                : "Upload Files or Drag here"}
        </Typography>

        <Typography
          variant="caption"
          sx={(theme) => ({
            color: error
              ? theme.palette.error.main
              : theme.palette.text.secondary,
            fontSize: "0.7rem",
          })}
        >
          {error ? error : (
            <>
              PDF, Word, Markdown, Image, Excel<br/>(max 2MB)
            </>
          )}
        </Typography>
      </Paper>
    </>
  );
}