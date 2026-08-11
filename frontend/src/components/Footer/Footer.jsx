import {
  Box,
  Typography,
} from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        minHeight: 'auto',
        px: 3,
        py: 0.1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.65rem",
          color: "text.secondary",
          opacity: 0.75,
          letterSpacing: 0.2,
        }}
      >
        &copy; 2026 &middot; DocHive · AI Document Assistant &middot; Built by Aman Saxena
      </Typography>
    </Box>
  );
}