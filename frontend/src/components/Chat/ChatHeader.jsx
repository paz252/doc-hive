import { useState } from "react";

import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircle";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";

import DocumentContextDialog from "../Sidebar/DocumentContextDialog";

export default function ChatHeader({
  documents,
  allDocumentsSelected,
  selectedDocuments,
  hasMessages,
  onClearChat,
  onContextChange,
}) {
  const [contextDialogOpen, setContextDialogOpen] =
    useState(false);

  const contextLabel = allDocumentsSelected
    ? "All Documents"
    : selectedDocuments.length === 0
      ? "No Documents"
      : selectedDocuments
        .map((document) => document.fileName)
        .join(", ");

  /*
   * The dialog works off ids - selectedDocuments only
   * carries the resolved document objects.
   */
  const selectedDocumentIds = selectedDocuments.map(
    (document) => document.id
  );

  return (
    <Box
      sx={(theme) => ({
        px: 3,
        py: 1,
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        backgroundColor: theme.palette.surface.chatHeader,
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            boxShadow:
              "0 0 2px #22c55e, 0 0 12px rgba(34,197,94,0.6)",
            flexShrink: 0,
            display: "block",
            mt: "1px",
            animation: "statusPulse 1.8s ease-in-out infinite",
            "@keyframes statusPulse": {
              "0%": {
                opacity: 0.6,
                transform: "scale(0.95)",
                boxShadow:
                  "0 0 0 rgba(34,197,94,0), 0 0 0 rgba(34,197,94,0)",
              },
              "50%": {
                opacity: 1,
                transform: "scale(1)",
                boxShadow:
                  "0 0 2px #22c55e, 0 0 16px rgba(34,197,94,0.7)",
              },
              "100%": {
                opacity: 0.6,
                transform: "scale(0.95)",
                boxShadow:
                  "0 0 0 rgba(34,197,94,0), 0 0 0 rgba(34,197,94,0)",
              },
            },
          }}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <Typography
            variant="caption"
            noWrap
            title={contextLabel}
            sx={(theme) => ({
              flex: "0 1 auto",
              minWidth: 0,
              letterSpacing: 0.5,
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.text.secondary
                  : theme.palette.text.disabled,
              ".context-label": {
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
                fontWeight: 700,
              },
            })}
          >
            <span style={{ color: "inherit" }}>Context:</span>{" "}
            <span className="context-label">{contextLabel}</span>
          </Typography>

          <Tooltip title="Add documents to context">
            <IconButton
              size="small"
              onClick={() => setContextDialogOpen(true)}
              aria-label="Add documents to context"
              sx={{ flexShrink: 0 }}
            >
              <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>

      <Tooltip title="Clear chat">
        <span>
          <IconButton
            size="small"
            onClick={onClearChat}
            disabled={!hasMessages}
            aria-label="Clear chat"
            sx={{
              fontSize: "0.75rem",
              px: 1,
              borderRadius: 1,
              color: "text.secondary",
              "&:hover": {
                color: "error.main",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(244, 67, 54, 0.08)"
                    : "rgba(244, 67, 54, 0.04)",
              },
            }}
          >
            <DeleteSweepOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Clear</span>
          </IconButton>
        </span>
      </Tooltip>

      <DocumentContextDialog
        open={contextDialogOpen}
        documents={documents}
        allDocumentsSelected={allDocumentsSelected}
        selectedDocumentIds={selectedDocumentIds}
        onClose={() => setContextDialogOpen(false)}
        onContextChange={onContextChange}
      />
    </Box>
  );
}
