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
              navbar: "#f2f6fb",
              sidebar: "#eef4fb",
              chatHeader: "#e8f0fb",
              chatWindow: "#f8fafc",
              chatInputBox: "#e8f0fb",
              chatInput: "#f1f5fb",
              documentItem: "#ffffff",
              documentItemSelected: "#eaf3ff",
            },
          }
        : {
            background: {
              default: "#0d1117",
              paper: "#161b22",
            },
            surface: {
              navbar: "#031424",
              sidebar: "#121b24",
              chatHeader: "#101821",
              chatWindow: "#0d1117",
              chatInputBox: "#101821",
              chatInput: "#171f2a",
              documentItem: "#1b2330",
              documentItemSelected: "#223247",
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