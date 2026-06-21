import { createContext, useContext, useState, useEffect } from 'react';
import { lobotechAppTheme, lobotechAppThemeLight } from '@/theme/main-theme.js';

// Crear el contexto
const ThemeContext = createContext();

// Temas disponibles
const themes = {
  dark: lobotechAppTheme,
  light: lobotechAppThemeLight,
};

// Provider del contexto
export const LobotechThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('lobotechAppTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Función para cambiar el tema
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    localStorage.setItem('lobotechAppTheme', newTheme);
  };

  // Función para establecer un tema específico
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('lobotechAppTheme', themeName);
    }
  };

  const value = {
    currentTheme,
    lobotechTheme: themes[currentTheme],
    toggleTheme,
    setTheme,
    availableThemes: Object.keys(themes),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useLobotechThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
