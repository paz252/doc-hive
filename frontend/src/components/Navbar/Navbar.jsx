import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  DarkMode,
  LightMode,
  MenuBookOutlined,
  AccountCircleOutlined
} from "@mui/icons-material";

export default function Navbar({
  mode,
  onToggleTheme,
}) {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={(theme) => ({
        backgroundColor: theme.palette.surface.navbar,
        border: "none",
      })}
    >
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexGrow: 1,
          }}
        >
          <MenuBookOutlined color="primary" />

          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Doc
            <Box
              component="span"
              sx={{ color: "primary.main" }}
            >
              Hive
            </Box>
          </Typography>
        </Box>

        {/* Portfolio Link */}
        <Typography
          component="a"
          href="https://paz252.github.io/my-portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={AccountCircleOutlined}
          sx={(theme) => ({
            mr: 1,
            fontSize: 13,
            fontWeight: 700,
            textTransform: "none",
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            borderRadius: 2,
            px: 1.5,
            "&:hover": {
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.action.hover,
            },
          })}
        >
          Developer's Portfolio
        </Typography>

        <IconButton
          onClick={onToggleTheme}
          color="inherit"
          aria-label="Toggle theme"
        >
          {mode === "dark" ? (
            <LightMode />
          ) : (
            <DarkMode />
          )}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}