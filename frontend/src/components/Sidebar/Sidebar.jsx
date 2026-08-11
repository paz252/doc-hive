import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Paper,
  Typography,
} from "@mui/material";

import DocumentUpload from "./DocumentUpload";
import DocumentCount from "./DocumentCount";
import DocumentSearch from "./DocumentSearch";
import DocumentList from "./DocumentList";
import DeleteDocumentDialog from "./DeleteDocumentDialog";
import DocumentInfoDialog from "./DocumentInfoDialog";

import useDocuments from "../../hooks/useDocuments";

export default function Sidebar({
  allDocumentsSelected,
  selectedDocumentIds,
  onContextChange,
  onDocumentsChange,
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

  const [documentToView, setDocumentToView] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  /*
   * Prevent the first-document initialization
   * from happening more than once.
   */
  const [contextInitialized, setContextInitialized] =
    useState(false);

  /*
   * Give AppLayout access to the complete document
   * list so ChatHeader can display filenames.
   */
  useEffect(() => {
    onDocumentsChange(documents);
  }, [documents, onDocumentsChange]);

  /*
   * Select the first document by default.
   */
  useEffect(() => {
    if (
      contextInitialized ||
      documents.length === 0
    ) {
      return;
    }

    onContextChange({
      allDocumentsSelected: false,
      documentIds: [documents[0].id],
    });

    setContextInitialized(true);
  }, [
    documents,
    contextInitialized,
    onContextChange,
  ]);

  /*
   * Filter documents by filename.
   */
  const filteredDocuments = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return documents;
    }

    return documents.filter((document) =>
      document.fileName
        .toLowerCase()
        .includes(query)
    );
  }, [documents, search]);

  /*
   * Select All Documents.
   *
   * Backend contract:
   *
   * documentIds = []
   */
  const handleSelectAll = () => {
    onContextChange({
      allDocumentsSelected: true,
      documentIds: [],
    });
  };

  /*
   * Select a single document.
   *
   * Clicking any document (regardless of the
   * current context) puts just that document
   * in context.
   */
  const handleSelect = (document) => {
    onContextChange({
      allDocumentsSelected: false,
      documentIds: [document.id],
    });
  };

  /*
   * Upload a document.
   *
   * useDocuments() refreshes the document list
   * after successful upload.
   */
  const handleUpload = async (file) => {
    await upload(file);
  };

  /*
   * Delete document.
   */
  const handleDelete = async () => {
    if (!documentToDelete) {
      return;
    }

    const deletedId = documentToDelete.id;

    try {
      setDeleting(true);

      await remove(deletedId);

      if (
        !allDocumentsSelected &&
        selectedDocumentIds.length === 1 &&
        selectedDocumentIds[0] === deletedId
      ) {
        const remainingDocuments =
          documents.filter(
            (document) => document.id !== deletedId
          );

        onContextChange({
          allDocumentsSelected: false,
          documentIds: remainingDocuments.length
            ? [remainingDocuments[0].id]
            : [],
        });
      } else {
        const nextSelection =
          selectedDocumentIds.filter(
            (id) => id !== deletedId
          );

        onContextChange({
          allDocumentsSelected: false,
          documentIds: nextSelection,
        });
      }

      setDocumentToDelete(null);
    } catch (err) {
      /*
       * useDocuments already exposes its error state.
       * Keep the dialog open if deletion fails.
       */
      console.error(
        "Failed to delete document:",
        err
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Paper
        square
        elevation={0}
        sx={(theme) => ({
          width: 310,
          flexShrink: 0,
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          border: "none",
          backgroundColor: theme.palette.surface.sidebar,
        })}
      >
        {/* Header + upload */}
        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1.5 }}
          >
            Documents
          </Typography>

          <DocumentUpload
            uploading={uploading}
            onUpload={handleUpload}
          />

          {/* Document count tile */}
          <Box sx={{ mt: 1.5 }}>
            <DocumentCount
              count={documents.length}
              selectedCount={
                allDocumentsSelected
                  ? documents.length
                  : selectedDocumentIds.length
              }
              allDocumentsSelected={
                allDocumentsSelected
              }
              onClick={handleSelectAll}
            />
          </Box>
        </Box>

        {/* Search */}
        <Box sx={{ p: 2 }}>
          <DocumentSearch
            value={search}
            onChange={setSearch}
          />
        </Box>

        {/* Document list */}
        <Box
          sx={(theme) => ({
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: 1.5,
            scrollbarWidth: "thin",
            scrollbarColor:
              theme.palette.mode === "dark"
                ? `${theme.palette.grey[800]} transparent`
                : `${theme.palette.grey[400]} transparent`,
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[600]
                  : theme.palette.grey[500],
              borderRadius: 999,
            },
          })}
        >
          <DocumentList
            documents={filteredDocuments}
            loading={loading}
            selectedDocumentIds={
              new Set(selectedDocumentIds)
            }
            allDocumentsSelected={
              allDocumentsSelected
            }
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onInfo={setDocumentToView}
            onDelete={setDocumentToDelete}
          />
        </Box>

        {/* Error */}
        {error && (
          <Box sx={{ p: 1 }}>
            <Alert severity="error">
              {error}
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Delete dialog */}
      <DeleteDocumentDialog
        document={documentToDelete}
        open={Boolean(documentToDelete)}
        deleting={deleting}
        onClose={() =>
          setDocumentToDelete(null)
        }
        onConfirm={handleDelete}
      />

      {/* Document information dialog */}
      <DocumentInfoDialog
        document={documentToView}
        open={Boolean(documentToView)}
        onClose={() =>
          setDocumentToView(null)
        }
      />
    </>
  );
}