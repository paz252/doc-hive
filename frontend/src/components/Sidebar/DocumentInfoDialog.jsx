import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";

import useDocumentChunks from "../../hooks/useDocumentChunks";
import { formatFileSize } from "../../utils/formatFileSize";
import { formatDate } from "../../utils/formatDate";

export default function DocumentInfoDialog({
  document,
  open,
  onClose,
}) {
  const {
    chunks,
    loading,
    error,
  } = useDocumentChunks(
    open ? document?.id : null
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
          gap: 0,
        }}
      >
        <DescriptionIcon color="primary" />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            noWrap
            title={document?.fileName}
          >
            {document?.fileName}
          </Typography>

          <Typography
            variant="caption"
            sx={(theme) => ({ color: theme.palette.text.secondary })}
          >
            Document details
          </Typography>
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            useFlexGap
          >
            {[
              {
                label: "Filetype",
                value: document?.contentType || "Unknown",
              },
              {
                label: "Size",
                value: formatFileSize(document?.fileSize),
              },
              {
                label: "Total chunks",
                value: document?.totalChunks ?? 0,
              },
              {
                label: "Uploaded at",
                value: formatDate(document?.uploadedAt),
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={(theme) => ({
                  flex: 1,
                  p: 1.5,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.025)",
                })}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={(theme) => ({
                    display: "block",
                    mb: 0.5,
                    color: theme.palette.text.secondary,
                  })}
                >
                  {item.label}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider />

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={(theme) => ({ 
                mb: 1.5, 
                color: theme.palette.text.white, 
              })}
            >
              Text chunks
            </Typography>

            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <CircularProgress size={28} />
              </Box>
            )}

            {error && (
              <Typography
                color="error"
                variant="body2"
              >
                {error}
              </Typography>
            )}

            {!loading &&
              !error &&
              chunks.length === 0 && (
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  No chunks found.
                </Typography>
              )}

            {!loading &&
              !error &&
              chunks.length > 0 && (
                <Stack spacing={1.5}>
                  {chunks.map((chunk, index) => (
                    <Box
                      key={chunk.id}
                      sx={{
                        p: 1.5,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.75 }}
                      >
                        Chunk {index + 1}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {chunk.content}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}