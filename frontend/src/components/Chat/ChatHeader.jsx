import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";

export default function ChatHeader({
  document,
  hasMessages,
  onClearChat,
}) {
  return (
    <Box
      sx={{
        px: 3,
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <DescriptionIcon color="primary" />

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={600}
          noWrap
        >
          {document.fileName}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {document.totalChunks} chunks
        </Typography>
      </Box>

      <Chip
        label="DocHive"
        size="small"
        variant="outlined"
      />

      <Tooltip title="Clear chat">
        <span>
          <IconButton
            size="small"
            onClick={onClearChat}
            disabled={!hasMessages}
            aria-label="Clear chat"
          >
            <DeleteSweepOutlinedIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}