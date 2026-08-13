import {
  Box,
  Typography,
} from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        minHeight: "auto",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 0.5, sm: 0.1 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: { xs: "0.6rem", sm: "0.65rem" },
          color: "text.secondary",
          opacity: 0.75,
          letterSpacing: 0.2,
          lineHeight: 1.5,
        }}
      >
        &copy; 2026 &middot; DocHive · AI Document Assistant &middot; Built by Aman Saxena
      </Typography>
    </Box>
  );
}