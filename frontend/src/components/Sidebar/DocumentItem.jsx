import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircle";

import { formatFileSize } from "../../utils/formatFileSize";

export default function DocumentItem({
  document,
  selected,
  onSelect,
  onInfo,
  onDelete,
}) {
  return (
    <Paper
      variant="outlined"
      onClick={() => onSelect(document)}
      sx={(theme) => ({
        p: { xs: 1.5, sm: 2 },
        cursor: "pointer",
        border: "none",
        backgroundColor: selected
          ? theme.palette.surface.documentItemSelected
          : theme.palette.surface.documentItem,
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: selected
            ? theme.palette.surface.documentItemSelected
            : theme.palette.action.hover,
        },
        // Only meaningful on devices that actually support hover;
        // on touch this selector simply never matches, which is fine
        // because the actions are opacity:1 by default below sm anyway.
        "&:hover .document-item-actions": {
          opacity: 1,
          pointerEvents: "auto",
        },
      })}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
      >
        <DescriptionIcon
          color="secondary"
          sx={{
            mt: 0.1,
            flexShrink: 0,
          }}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            title={document.fileName}
          >
            {document.fileName}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 0,
              minWidth: 0,
            }}
          >
            <Typography
              variant="caption"
              sx={(theme) => ({
                fontSize: "0.7rem",
                color: theme.palette.text.secondary,
              })}
            >
              {formatFileSize(document.fileSize)}
            </Typography>

            <Stack
              direction="row"
              spacing={0}
              onClick={(event) => event.stopPropagation()}
              className="document-item-actions"
              sx={{
                // Always visible + tappable on touch (xs/sm), hover-reveal on desktop (md+)
                opacity: { xs: 1, md: 0 },
                pointerEvents: { xs: "auto", md: "none" },
                transition: "opacity 0.2s ease",
                "&:hover": {
                  opacity: 1,
                  pointerEvents: "auto",
                },
              }}
            >
              <Tooltip title="Document information">
                <IconButton
                  size="small"
                  onClick={() => onInfo(document)}
                  sx={{
                    color: "text.secondary",
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    p: 0.35,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#22d3ee",
                      backgroundColor: "transparent",
                      boxShadow: "0 0 10px rgba(34, 211, 238, 0.6)",
                      outline: "none",
                    },
                    "&.Mui-focusVisible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  <InfoIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete document">
                <IconButton
                  size="small"
                  onClick={() => onDelete(document)}
                  sx={{
                    color: "text.secondary",
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    p: 0.35,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#ef4444",
                      backgroundColor: "transparent",
                      boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
                      outline: "none",
                    },
                    "&.Mui-focusVisible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Box
            sx={{
              mt: 0.1,
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
              })}
            >
              {document.totalChunks} chunks
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.2}
              sx={{
                color: "success.main",
                ml: "auto",
                mt: "1px",
              }}
            >
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: 11,
                  display: "block",
                  transform: "translateY(1px)",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "success.main",
                  fontWeight: 600,
                }}
              >
                Indexed
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}