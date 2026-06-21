import { createTheme } from "@mui/material";

export const toroBurgerTheme = createTheme({
    palette: {
        primary: { main: '#FFEB3B', secondary: '#000000' },  // Amarillo / Negro
        background: { main: '#212529', default: '#000000' }, //Azul oscuro // Negro
        text: { primary: '#FFEB3B', secondary: '#000000', terciary: '#FFFF' },  // Amarillo / Negro / Blanco para el texto
        loading: { main: '#FFEB3B', background: '#000' }, // AMARILLO - NEGRO
        navbarmenu: { background: '#FFF', text: '#000' },
    },
    typography: {
        fontFamily: {
            primary: 'Eudora' || 'main-app-oswald',
            secondary: 'main-app-oswald',
            terciary: 'main-app-oswald',
        }
    }
});