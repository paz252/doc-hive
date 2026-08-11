import {
  Box,
  Chip,
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
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
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
            color="text.secondary"
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
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={`${document?.totalChunks} chunks`}
            />

            <Chip
              label={formatFileSize(
                document?.fileSize
              )}
            />

            <Chip
              label={document?.contentType}
              variant="outlined"
            />

            <Chip
              label={`Uploaded ${formatDate(
                document?.uploadedAt
              )}`}
              variant="outlined"
            />
          </Stack>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              Metadata
            </Typography>

            <Stack spacing={0.75}>
              <Typography variant="body2">
                <strong>Filename:</strong>{" "}
                {document?.fileName}
              </Typography>

              <Typography variant="body2">
                <strong>Content type:</strong>{" "}
                {document?.contentType}
              </Typography>

              <Typography variant="body2">
                <strong>File size:</strong>{" "}
                {formatFileSize(
                  document?.fileSize
                )}
              </Typography>

              <Typography variant="body2">
                <strong>Total chunks:</strong>{" "}
                {document?.totalChunks}
              </Typography>

              <Typography variant="body2">
                <strong>Uploaded:</strong>{" "}
                {formatDate(
                  document?.uploadedAt
                )}
              </Typography>

              <Typography variant="body2">
                <strong>ID:</strong>{" "}
                {document?.id}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 1.5 }}
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
                        borderRadius: 2,
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