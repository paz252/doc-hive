import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  DarkMode,
  LightMode,
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
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            flexGrow: 1,
            letterSpacing: "-0.02em",
          }}
        >
          DocHive
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