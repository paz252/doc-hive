import {
  Box,
  Typography,
} from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        minHeight: 40,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        DocHive · AI Document Assistant
      </Typography>
    </Box>
  );
}