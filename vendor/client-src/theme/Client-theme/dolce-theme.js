import { createTheme } from "@mui/material";

// ---- PERSONALIZADO ----

// NARANJA LOGO: #F57A34
// BLANCO FONDO: #fffcf2
// BEIGE #FFF8DC
// CASI BLANCO #EDEDE9
// ROSA #F296BD
// AMARILLO #FCCA59
// ROJO #CA151C
// VERDE #267F53

// ---- FONDO NARANJA - CARDS BEIGE ----
export const dolceTheme = createTheme({
    palette: {
        primary: { main: '#F57A34', secondary: '#FFF8DC' },
        background: { main: '#fffcf2', default: '#FFF8DC', paper: '#FFF' },
        text: { primary: '#F57A34', secondary: '#EDEDE9', terciary: '#000' },
        loading: { main: '#F57A34' },
        navbarmenu: { background: '#FFF', text: '#000' },
    },
    typography: {
        fontFamily: {
            primary: 'montserrat-extrabold',
            secondary: 'main-app-oswald',
            terciary: 'main-app-oswald',
        }
    }
});