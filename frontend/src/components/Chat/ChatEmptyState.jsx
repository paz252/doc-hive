import {
  Box,
  Stack,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function ChatEmptyState({
  document,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Stack
        alignItems="center"
        spacing={1}
        sx={{
          maxWidth: 500,
          textAlign: "center",
        }}
      >
        <AutoAwesomeIcon
          sx={{
            fontSize: 42,
            color: "primary.main",
            mb: 1,
          }}
        />

        <Typography
          variant="h5"
          fontWeight={600}
        >
          Ask about your document
        </Typography>

        <Typography
          color="text.secondary"
        >
          Ask questions, summarize sections,
          or extract information from{" "}
          <strong>{document.fileName}</strong>.
        </Typography>
      </Stack>
    </Box>
  );
}