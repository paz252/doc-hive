import { useRef } from "react";

import {
  Button,
  CircularProgress,
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
        accept=".pdf,.docx,.txt,.md"
        onChange={handleChange}
      />

      <Button
        fullWidth
        variant="contained"
        startIcon={
          uploading ? (
            <CircularProgress
              size={18}
              color="inherit"
            />
          ) : (
            <UploadFileIcon />
          )
        }
        disabled={uploading}
        onClick={handleClick}
      >
        {uploading
          ? "Uploading..."
          : "Upload Document"}
      </Button>
    </>
  );
}