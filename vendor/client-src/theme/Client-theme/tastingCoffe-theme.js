import { createTheme } from "@mui/material";

// ---- PERSONALIZADO ----
// export const tastingCoffeTheme = createTheme({
//     palette: {
//         primary: { main: '#CD853F', secondary: '#000' },  // MARRON DORADO / NEGRO
//         background: { main: '#FFF8DC', default: '#2F1B14', paper: '#FFF' }, // CREMA / MARRON / BLANCO
//         text: { primary: '#CD853F', secondary: '#000', terciary: '#FFF' },  // MARRON DORADO / NEGRO / BLANCO
//         loading: { main: '#CD853F' }, // MARRON DORADO
//     },
//     typography: {
//         fontFamily: {
//             primary: "main-app-oswald", // "main-app-title"
//             secondary: 'main-app-oswald',
//             terciary: 'Playfair Display, serif',
//         }
//     }
// });

// ---------- V1 modernCalmTheme - LIGHT THEME -----------
export const tastingCoffeTheme = createTheme({
    palette: {
        primary: { main: '#2F1B14', secondary: '#FFF' },  // Azul oscuro / BLANCO
        background: { main: '#edede9', default: '#FFF', paper: '#2F1B14' }, // Casi blanco / Blanco puro / Gris clarito (MAIN: #F9FAFB || #edede9 )
        text: { primary: '#2F1B14', secondary: '#FFF', terciary: '#000' },  // Azul oscuro / Casi blanco / NEGRO
        loading: { main: '#2F1B14', background: '#edede9' }, // AZUL OSCURO - CASI BLANCO
        navbarmenu: { background: '#FFF', text: '#000' },
    },
    typography: {
        fontFamily: {
            primary: "main-app-text",
            secondary: 'main-app-oswald',
            terciary: 'main-app-oswald',
        }
    }
});