import { createContext, useContext, useEffect, useMemo, useState } from "react";

// ---- Material UI ----
import { CssBaseline, ThemeProvider } from "@mui/material";
// ---------------------

// ---- Context ----
import { LobotechThemeProvider } from "@/context/ThemeContext.jsx";
import { useLobotechThemeContext } from "@/context/lobotechThemeContext.js";
import { createTotemTheme } from "./totemTheme.js";
// -----------------

const TotemBackgroundContext = createContext({ mode: "theme", imageUrl: "" });
export const useTotemBackground = () => useContext(TotemBackgroundContext);

const TotemMuiTheme = ({ children, initialBackground }) => {
  const { lobotechTheme, setTheme } = useLobotechThemeContext();

  const theme = useMemo(() => createTotemTheme(lobotechTheme), [lobotechTheme]);
  const [background, setBackground] = useState(
    initialBackground || { mode: "theme", imageUrl: "" },
  );

  useEffect(() => window.totemAPI?.onBackgroundChanged?.(setBackground), []);

  useEffect(() => {
    return window.totemAPI?.onThemeChanged?.((themeName) => {
      setTheme(themeName);
    });
  }, [setTheme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TotemBackgroundContext.Provider value={background}>
        {children}
      </TotemBackgroundContext.Provider>
    </ThemeProvider>
  );
};

export const TotemProviders = ({
  children,
  initialTheme,
  initialBackground,
}) => (
  <LobotechThemeProvider
    storageKey="lobotechTotemTheme"
    initialTheme={initialTheme}
  >
    <TotemMuiTheme initialBackground={initialBackground}>
      {children}
    </TotemMuiTheme>
  </LobotechThemeProvider>
);
