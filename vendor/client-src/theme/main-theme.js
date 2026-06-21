import { createTheme } from "@mui/material";

// LOBOTECH THEME (DARK)
export const lobotechAppTheme = createTheme({
  // #f5a623 Naranja dorado
  // #f8e71c Amarillo brillante
  // #edede9 Casi blanco
  // #b8b6ba Gris claro
  // #9a989c Gris un poco más oscuro que el anterior
  // #343a40 Gris un poco más oscuro que el anterior
  // #2c3034 Gris un poco más oscuro que el anterior
  // #212529 Gris oscuro
  // #dc3545 Rojo para errores
  // #28a745 Verde para éxito
  palette: {
    mode: 'dark',
    primary: {
      main: '#f5a623',
      light: "#f8e71c",
      dark: '#212529',
    },
    secondary: {
      main: "#b8b6ba",
      dark: "#9a989c",
    },
    background: {
      main: '#212529',
      default: '#343a40',
      paper: "#2c3034",
      light: "#edede9",
    },
    text: {
      primary: "#FFFF",
      secondary: '#b8b6ba',
      terciary: '#000',
    },
    loading: { main: '#f5a623', background: '#212529' },
    error: {
      main: "#dc3545",
    },
    success: {
      main: "#28a745",
    },
    navbarmenu: { background: '#212529', text: '#edede9' },
  },
  typography: {
    fontFamily: {
      primary: 'main-app-oswald',
      secondary: 'main-app-text',
      terciary: 'main-app-oswald',
    }
  }
});

// LOBOTECH THEME (LIGHT)
export const lobotechAppThemeLight = createTheme({
  // #f5a623 Naranja dorado (MANTENIDO)
  // #f8e71c Amarillo brillante (MANTENIDO)
  // #ffffff Blanco puro
  // #f8f9fa Gris muy claro (casi blanco)
  // #e9ecef Gris claro
  // #dee2e6 Gris un poco más oscuro
  // #ced4da Gris medio claro
  // #adb5bd Gris medio
  // #6c757d Gris medio oscuro
  // #495057 Gris oscuro para texto
  // #343a40 Gris muy oscuro para texto principal
  // #dc3545 Rojo para errores (MANTENIDO)
  // #28a745 Verde para éxito (MANTENIDO)

  palette: {
    mode: "light",
    primary: {
      main: "#f5a623", // Naranja mantenido
      light: "#f8e71c", // Amarillo mantenido
      dark: "#343a40", // Gris oscuro para contraste
    },
    secondary: {
      main: "#6c757d", // Gris medio para secondary
      dark: "#495057", // Gris más oscuro
    },
    background: {
      main: "#f4f5f7",
      default: "#fbfbfc",
      paper: "#ffffff",
      light: "#dee2e6",
    },
    text: {
      primary: "#212529", // Gris oscuro para texto principal
      secondary: "#6c757d", // Gris medio para texto secundario
      terciary: "#000", // Negro para texto terciario
    },
    loading: {
      main: "#f5a623", // Naranja mantenido
      background: "#f8f9fa", // Fondo claro para loading
    },
    error: {
      main: "#dc3545", // Rojo mantenido
    },
    success: {
      main: "#28a745", // Verde mantenido
    },
    navbarmenu: {
      background: "#edede9", // Fondo blanco para navbar
      text: "#f5a623", // Texto naranja mantenido
    },
  },
  typography: {
    fontFamily: {
      primary: "main-app-oswald",
      secondary: "main-app-text",
      terciary: "main-app-oswald",
    },
  },
})

// THEME PARA LOS MODALES
export const mainAppModalTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#f5a623", // Naranja dorado del gradiente
      light: "#f8e71c", // Amarillo brillante del gradiente
    },
    secondary: {
      main: "#b8b6ba", // Gris claro de tu paleta
      dark: "#9a989c", // Variación más oscura del gris
    },
    background: {
      default: "#212529", // Fondo principal oscuro
      paper: "#2c3034", // Fondo de papel un poco más claro que el principal
      card: "#343a40", // Fondo para tarjetas, un poco más claro
    },
    text: {
      primary: "#edede9", // Texto principal blanco
      secondary: "#b8b6ba", // Texto secundario gris claro
      terciary: "#000", // NEGRO
    },
    loading: { main: '#f5a623', background: '#212529' }, // NARANJA DORADO - GRIS OSCURO
    error: {
      main: "#dc3545", // Rojo para errores
    },
    success: {
      main: "#28a745", // Verde para éxito
    },
  },
  typography: {
    fontFamily: {
      primary: 'main-app-title',
      secondary: 'main-app-text',
      terciary: 'main-app-oswald',
    }
  },
})

// LOBOTECH THEME (LIGHT)
export const lobotechAppFoodDetailTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#f5a623",
    },
    background: {
      default: "#212529", // Gris muy claro
      paper: "#edede9", // Blanco para cards/papers
    },
    text: {
      primary: "#edede9", // Gris oscuro para texto principal
      secondary: "#000", // Gris medio para texto secundario
      terciary: "#fff", // Negro para texto terciario
    },
    error: {
      main: "#dc3545", // Rojo mantenido
    },
    success: {
      main: "#28a745", // Verde mantenido
    },
  },
  typography: {
    fontFamily: {
      primary: "main-app-oswald",
      secondary: "main-app-oswald",
      terciary: "main-app-oswald",
    },
  },
})
