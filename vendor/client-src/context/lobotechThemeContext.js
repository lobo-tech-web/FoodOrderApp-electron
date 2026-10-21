import { createContext, useContext } from "react";

export const ThemeContext = createContext();

export const useLobotechThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useLobotechThemeContext debe usarse dentro de LobotechThemeProvider",
    );
  }
  return context;
};
