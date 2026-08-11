import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";

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
        p: 1.5,
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
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ width: "100%" }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <DescriptionIcon
            color="primary"
            sx={{
              fontSize: 24,
              flexShrink: 0,
              mt: 0.3,
            }}
          />

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              lineHeight={1.2}
            >
              All Documents
            </Typography>

            <Typography
              variant="caption"
              sx={(theme) => ({
                display: "block",
                color: theme.palette.text.secondary,
                lineHeight: 1.4,
              })}
            >
              Search across complete corpus
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={(theme) => ({
            minWidth: 22,
            height: 22,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.common.white,
            fontWeight: 700,
            fontSize: "0.9rem",
            lineHeight: 1,
            flexShrink: 0,
            ml: "auto",
            alignSelf: "center",
          })}
        >
          {count}
        </Box>
      </Stack>
    </Paper>
  );
}