import { useState, useCallback } from "react";
import { ThemeContext } from "./lobotechThemeContext.js";
import { themes, isValidTheme } from "@/theme/themeRegistry.js";

// Provider del contexto
export const LobotechThemeProvider = ({
  children,
  storageKey = "lobotechAppTheme",
  initialTheme = null,
}) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (isValidTheme(initialTheme)) return initialTheme;

    try {
      const savedTheme = window.localStorage.getItem(storageKey);
      if (isValidTheme(savedTheme)) return savedTheme;
    } catch {
      // El tema también funciona sin localStorage.
    }

    return "dark";
  });

  const setTheme = useCallback(
    (themeName) => {
      if (!isValidTheme(themeName)) return;

      setCurrentTheme(themeName);

      try {
        window.localStorage.setItem(storageKey, themeName);
      } catch {
        // Conservamos el cambio durante esta sesión.
      }
    },
    [storageKey],
  );

  const toggleTheme = () => {
    setTheme(themes[currentTheme].palette.mode === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        lobotechTheme: themes[currentTheme],
        toggleTheme,
        setTheme,
        availableThemes: Object.keys(themes),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
