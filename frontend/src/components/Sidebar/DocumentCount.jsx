import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

export default function DocumentCount({
  count,
  allDocumentsSelected,
  selectedCount,
  onClick,
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={(theme) => ({
        p: 1.25,
        cursor: "pointer",
        border: "none",
        backgroundColor: allDocumentsSelected
          ? theme.palette.surface.documentItemSelected
          : theme.palette.surface.documentItem,
        transition:
          "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: allDocumentsSelected
            ? theme.palette.surface.documentItemSelected
            : theme.palette.action.hover,
        },
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            flexShrink: 0,
          }}
        >
          <DescriptionOutlinedIcon fontSize="small" />
        </Box>

        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
            lineHeight={1.1}
          >
            {count}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {allDocumentsSelected
              ? "All Documents"
              : `${selectedCount} selected`}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}