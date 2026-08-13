import {
  AppBar,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  DarkMode,
  LightMode,
  MenuBookOutlined,
  OpenInNew,
  GitHub,
  StorageOutlined,
} from "@mui/icons-material";

import { endPoints } from "../../api/myResources";

export default function Navbar({
  mode,
  onToggleTheme,
  stats,
  storageLimitMB = 500, // adjust to your Supabase plan's actual limit
}) {
  const usagePercent = Math.min(
    (stats.total_size_mb / storageLimitMB) * 100,
    100
  );

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
      <Toolbar
        sx={{
          gap: { xs: 0.5, sm: 1 },
          px: { xs: 1, sm: 2 },
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <MenuBookOutlined color="primary" />

          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
          >
            Doc
            <Box component="span" sx={{ color: "primary.main" }}>
              Hive
            </Box>
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Storage/usage indicator — collapses to icon-only below sm */}
        <Tooltip
          title={`${stats.total_size_mb.toFixed(2)} MB of ${storageLimitMB} MB · ${stats.chunk_count} chunks`}
          enterDelay={0}
          leaveDelay={0}
        >
          <Box
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              minWidth: { xs: 0, sm: 160 },
              gap: 1,
              px: { xs: 0.75, sm: 1.5 },
              py: 0.5,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.surface.sidebar,
              cursor: "default",
              transition: "border-color 0.2s, background-color 0.2s",
              "&:hover": {
                borderColor: theme.palette.info.main,
                backgroundColor: theme.palette.action.hover,
                "& .storage-icon": { color: theme.palette.info.main },
                "& .storage-text": { color: theme.palette.info.main },
              },
            })}
          >
            <StorageOutlined
              className="storage-icon"
              sx={{ fontSize: 16, color: "text.secondary", transition: "color 0.2s" }}
            />
            {/* Text + progress bar hidden below sm — icon + tooltip carries the info */}
            <Box sx={{ minWidth: 120, display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="caption"
                className="storage-text"
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "text.secondary",
                  lineHeight: 1.2,
                  display: "block",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {stats.doc_count} docs · {stats.total_size_mb.toFixed(2)}/{storageLimitMB} MB
              </Typography>
              <LinearProgress
                variant="determinate"
                value={usagePercent}
                sx={(theme) => ({
                  height: 3,
                  borderRadius: 2,
                  mt: 0.3,
                  backgroundColor: theme.palette.divider,
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      usagePercent > 90
                        ? theme.palette.error.main
                        : theme.palette.warning.main,
                    transition: "background-color 0.2s",
                  },
                })}
              />
            </Box>
          </Box>
        </Tooltip>

        <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />

        {/* Portfolio Link — full text button on md+, icon-only below md */}
        <Tooltip title="View Portfolio">
          <Button
            component="a"
            href={endPoints.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<OpenInNew />}
            sx={(theme) => ({
              display: { xs: "none", md: "inline-flex" },
              fontSize: 11,
              fontWeight: 700,
              textTransform: "none",
              color: theme.palette.text.secondary,
              backgroundColor: theme.palette.surface.sidebar,
              borderColor: theme.palette.divider,
              borderRadius: 1,
              px: 1,
              whiteSpace: "nowrap",
              "&:hover": {
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.hover,
              },
            })}
          >
            Developer's Portfolio
          </Button>
        </Tooltip>

        {/* Portfolio Link */}
        <Tooltip title="View Portfolio">
          <IconButton
            component="a"
            href={endPoints.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Developer's Portfolio"
            sx={{ display: { xs: "inline-flex", md: "none" }, color: "text.secondary" }}
          >
            <OpenInNew sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* GitHub Link */}
        <Tooltip title="View source on GitHub">
          <IconButton
            component="a"
            href={endPoints.gitHubSource}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            sx={{ ml: { xs: 0, sm: 1 }, color: "text.secondary" }}
          >
            <GitHub sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <IconButton
          onClick={onToggleTheme}
          color="inherit"
          aria-label="Toggle theme"
          sx={{ ml: { xs: 0, sm: 1 } }}
        >
          {mode === "dark" ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}