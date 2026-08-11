import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,

      ...(mode === "light"
        ? {
            background: {
              default: "#f5f7fa",
              paper: "#ffffff",
            },
            surface: {
              navbar: "#eef2fa",
              sidebar: "#e4ecf9",
              chatHeader: "#dde9fa",
              chatWindow: "#f8fafc",
              chatInputBox: "#dde9fa",
              chatInput: "#eef3fb",
              documentItem: "#ffffff",
              documentItemSelected: "#d9e8ff",
            },
          }
        : {
            background: {
              default: "#0d1117",
              paper: "#161b22",
            },
            surface: {
              navbar: "#020c18",
              sidebar: "#0f1720",
              chatHeader: "#0c141d",
              chatWindow: "#06080a",
              chatInputBox: "#0c141d",
              chatInput: "#161f2b",
              documentItem: "#1a2230",
              documentItemSelected: "#20304a",
            },
          }),
    },

    typography: {
      fontFamily: [
        "Inter",
        "Roboto",
        "Arial",
        "sans-serif",
      ].join(","),
    },

    shape: {
      borderRadius: 10,
    },

    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });