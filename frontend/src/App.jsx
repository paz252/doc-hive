import { useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { getTheme } from "./theme/theme";
import AppLayout from "./components/Layout/AppLayout";

export default function App() {
  const [mode, setMode] = useState("dark");

  const theme = useMemo(
    () => getTheme(mode),
    [mode]
  );

  const toggleTheme = () => {
    setMode((current) =>
      current === "light" ? "dark" : "light"
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout mode={mode} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  );
}