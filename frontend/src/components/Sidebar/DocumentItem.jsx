import {
  Box,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { Description as DescriptionIcon, Delete as DeleteOutlineIcon } from "@mui/icons-material";

import { formatFileSize } from "../../utils/formatFileSize";
import { formatDate } from "../../utils/formatDate";

export default function DocumentItem({
  document,
  selected,
  onSelect,
  onDelete,
}) {
  return (
    <Paper
      variant="outlined"
      onClick={() => onSelect(document)}
      sx={{
        p: 1.25,
        cursor: "pointer",
        borderColor: selected
          ? "primary.main"
          : "divider",
        backgroundColor: selected
          ? "action.selected"
          : "background.paper",
        transition: "border-color 0.2s",
      }}
    >
      <Stack direction="row" spacing={1}>
        <DescriptionIcon
          color="primary"
          sx={{ mt: 0.25 }}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            title={document.fileName}
          >
            {document.fileName}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
          >
            {formatFileSize(document.fileSize)}
            {" · "}
            {document.totalChunks} chunks
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
          >
            Uploaded {formatDate(document.uploadedAt)}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(document);
          }}
          aria-label={`Delete ${document.fileName}`}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}