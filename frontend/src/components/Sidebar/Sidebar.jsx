import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import DocumentUpload from "./DocumentUpload";
import DocumentCount from "./DocumentCount";
import DocumentSearch from "./DocumentSearch";
import DocumentList from "./DocumentList";
import DeleteDocumentDialog from "./DeleteDocumentDialog";

import useDocuments from "../../hooks/useDocuments";

export default function Sidebar({
  selectedDocument,
  onSelectDocument,
}) {
  const {
    documents,
    loading,
    uploading,
    error,
    upload,
    remove,
  } = useDocuments();

  const [search, setSearch] = useState("");
  const [documentToDelete, setDocumentToDelete] =
    useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return documents;
    }

    return documents.filter((document) =>
      document.fileName
        .toLowerCase()
        .includes(query)
    );
  }, [documents, search]);

  const handleUpload = async (file) => {
    const document = await upload(file);

    onSelectDocument(document);
  };

  const handleDelete = async () => {
    if (!documentToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await remove(documentToDelete.id);

      if (
        selectedDocument?.id ===
        documentToDelete.id
      ) {
        onSelectDocument(null);
      }

      setDocumentToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Paper
        square
        elevation={0}
        sx={{
          width: 280,
          flexShrink: 0,
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 1.5 }}
          >
            Documents
          </Typography>

          <DocumentUpload
            uploading={uploading}
            onUpload={handleUpload}
          />

          <Box sx={{ mt: 1.5 }}>
            <DocumentCount count={documents.length} />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <DocumentSearch
            value={search}
            onChange={setSearch}
          />
        </Box>

        <Divider />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: 1.5,
          }}
        >
          <DocumentList
            documents={filteredDocuments}
            loading={loading}
            selectedDocument={selectedDocument}
            onSelect={onSelectDocument}
            onDelete={setDocumentToDelete}
          />
        </Box>

        {error && (
          <Box sx={{ p: 1 }}>
            <Alert severity="error">
              {error}
            </Alert>
          </Box>
        )}
      </Paper>

      <DeleteDocumentDialog
        document={documentToDelete}
        open={Boolean(documentToDelete)}
        deleting={deleting}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}