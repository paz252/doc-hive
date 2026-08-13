import {
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

export default function DocumentContextDialog({
  open,
  documents,
  allDocumentsSelected,
  selectedDocumentIds,
  onClose,
  onContextChange,
}) {
  /*
   * "All Documents" can only be turned on directly - the
   * API has no way to represent zero documents (an empty
   * documentIds list is interpreted as All Documents), so
   * there's no valid "off" state to switch to on its own.
   * Leaving All Documents happens by picking a specific
   * document below instead.
   */
  const handleToggleAll = () => {
    if (allDocumentsSelected) {
      return;
    }

    onContextChange({
      allDocumentsSelected: true,
      documentIds: [],
    });
  };

  /*
   * Clicking a document while "All Documents" is active
   * switches context to just that document, matching how
   * the sidebar's document list behaves.
   */
  const handleToggleDocument = (documentId) => {
    if (allDocumentsSelected) {
      onContextChange({
        allDocumentsSelected: false,
        documentIds: [documentId],
      });

      return;
    }

    const isSelected =
      selectedDocumentIds.includes(documentId);

    const nextIds = isSelected
      ? selectedDocumentIds.filter(
        (id) => id !== documentId
      )
      : [...selectedDocumentIds, documentId];

    /*
     * The API treats an empty document list as All
     * Documents, so collapse back into that state
     * explicitly rather than leaving a "no documents"
     * selection that doesn't actually exist server-side.
     * Likewise, if every document ends up individually
     * checked, that's equivalent to All Documents too.
     */
    if (
      nextIds.length === 0 ||
      nextIds.length === documents.length
    ) {
      onContextChange({
        allDocumentsSelected: true,
        documentIds: [],
      });

      return;
    }

    onContextChange({
      allDocumentsSelected: false,
      documentIds: nextIds,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6">
            Documents In Context
          </Typography>

          <Typography
            variant="subtitle2"
            sx={(theme) => ({
              color: theme.palette.text.secondary
            })}
          >
            Choose which documents this chat can see
          </Typography>
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{
        p: 0,
        maxHeight: { xs: "60vh", sm: "65vh" },
        overflowY: "auto",
      }}>
        <List disablePadding>
          <ListItemButton
            divider
            onClick={handleToggleAll}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Checkbox
                edge="start"
                checked={allDocumentsSelected}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>

            <ListItemText
              primary="All Documents"
              primaryTypographyProps={{
                fontWeight: 700,
              }}
            />
          </ListItemButton>

          {documents.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No documents uploaded yet.
              </Typography>
            </Box>
          )}

          {documents.map((document) => {
            const checked =
              allDocumentsSelected ||
              selectedDocumentIds.includes(
                document.id
              );

            return (
              <ListItemButton
                key={document.id}
                divider
                onClick={() =>
                  handleToggleDocument(document.id)
                }
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={checked}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>

                <ListItemIcon sx={{ minWidth: 32 }}>
                  <DescriptionOutlinedIcon
                    fontSize="small"
                    color="secondary"
                  />
                </ListItemIcon>

                <ListItemText
                  primary={document.fileName}
                  primaryTypographyProps={{
                    noWrap: true,
                    title: document.fileName,
                    variant: "body2",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
}
