import { createTheme } from "@mui/material";

export const laNacionTheme = createTheme({
    palette: {
        primary: { main: '#2F1B14', secondary: '#FFF' },  // Azul oscuro / BLANCO
        background: { main: '#edede9', default: '#FFF', paper: '#2F1B14' }, // Casi blanco / Blanco puro / Gris clarito (MAIN: #F9FAFB || #edede9 )
        text: { primary: '#2F1B14', secondary: '#FFF', terciary: '#000' },  // Azul oscuro / Casi blanco / NEGRO
        loading: { main: '#2F1B14', background: '#edede9' }, // AZUL OSCURO - CASI BLANCO
        navbarmenu: { background: '#FFF', text: '#000' },
    },
    typography: {
        fontFamily: {
            primary: "main-app-text", // main-app-oswald
            secondary: 'main-app-oswald',
            terciary: 'main-app-oswald',
        }
    }
});