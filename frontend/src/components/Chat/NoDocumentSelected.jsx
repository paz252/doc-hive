import {
  Box,
  Stack,
  Typography,
} from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

export default function NoDocumentSelected() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        alignItems="center"
        spacing={1}
        sx={{
          textAlign: "center",
          px: 3,
        }}
      >
        <DescriptionOutlinedIcon
          sx={{
            fontSize: 48,
            color: "text.secondary",
          }}
        />

        <Typography
          variant="h5"
          fontWeight={600}
        >
          Select a document
        </Typography>

        <Typography color="text.secondary">
          Choose a document from the sidebar
          to start chatting with DocHive.
        </Typography>
      </Stack>
    </Box>
  );
}