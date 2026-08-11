import {
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import DocumentItem from "./DocumentItem";

export default function DocumentList({
  documents,
  loading,
  selectedDocumentIds,
  onSelect,
  onInfo,
  onDelete,
}) {
  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ py: 4 }}
      >
        <CircularProgress size={24} />
      </Stack>
    );
  }

  if (documents.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ py: 4 }}
      >
        No documents found
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {documents.map((document) => (
        <DocumentItem
          key={document.id}
          document={document}
          selected={selectedDocumentIds.has(
            document.id
          )}
          onSelect={onSelect}
          onInfo={onInfo}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}