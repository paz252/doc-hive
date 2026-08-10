import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

export default function DocumentCount({
  count,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        backgroundColor: "action.hover",
      }}
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
            {count === 1
              ? "Document"
              : "Documents"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}