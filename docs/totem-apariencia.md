# Fondo local y cierre

En el menú de Electron: **Tótem → Fondo del tótem → Cargar imagen de fondo…**.
Requiere una sesión de administrador. Se admite PNG o JPG de hasta 10 MB.
La imagen se copia y normaliza a PNG dentro de `totem-appearance.json`, en la
carpeta `userData` de Electron de esta PC y usuario de Windows. No se envía al
backend ni se sincroniza con otros tótems; podés mover el archivo original.
Las imágenes grandes se reducen conservando la proporción hasta 3840 × 2160.
El fondo usa `cover`: llena la pantalla sin estirarse, recortando los bordes si hace falta.

**Colores del tema** vuelve al fondo predeterminado. **Imagen guardada en esta PC**
reactiva la última imagen. Cada equipo debe configurarse por separado.

En modo tótem de producción, la barra superior incluye **Cerrar tótem**.
En equipos vinculados abre la confirmación de contraseña del administrador del
local. Si todavía no está vinculado, usa la confirmación de cierre de configuración.
El modo kiosco y la protección de Alt+F4 se conservan.

# Sugerencias de colores (sin aplicar)

Conservá el naranja `#F5A623` y probá una de estas variantes en
`vendor/client-src/theme/main-theme.js`, dentro de `lobotechAppTheme.palette`:

| Propiedad | Carbón cálido | Pizarra azulada |
| --- | --- | --- |
| `background.main` | `#201E1B` | `#171E26` |
| `background.paper` | `#292621` | `#222C38` |
| `background.default` | `#302D28` | `#2B3745` |
| `text.primary` | `#F3EEE7` | `#F2F5F8` |
| `text.secondary` | `#BEB5A8` | `#ABB8C8` |
| `divider` | `#4A4338` | `#3A4859` |

Carbón cálido combina especialmente con gastronomía y fotografía de café.
Pizarra azulada da más contraste cromático al naranja y un aspecto más técnico.
Usá `main` para el lienzo, `paper` para tarjetas y `default` para campos o superficies
secundarias. Probá textos, estados deshabilitados y bordes sobre cada superficie;
reservá el naranja para acciones e información destacada.

# Probar Roboto (sin aplicar)

1. `src/main.jsx` ya importa `@fontsource/roboto`, que carga el peso 400. Para
   botones y textos en negrita, agregá:

   ```jsx
   import "@fontsource/roboto/500.css";
   import "@fontsource/roboto/700.css";
   ```

2. En `vendor/client-src/theme/main-theme.js`, dentro de `lobotechAppTheme`,
   cambiá primero solo el alias `secondary` para comparar la lectura:

   ```js
   typography: {
     fontFamily: {
       primary: "main-app-oswald",
       secondary: '"Roboto", Arial, sans-serif',
       terciary: "main-app-oswald",
     },
   },
   ```

3. Si querés probar Roboto en toda la interfaz, usá esa misma cadena también
   en `primary` y `terciary`. Conservá este objeto de alias: la aplicación tiene
   componentes con `sx={{ fontFamily: "fontFamily.primary" }}` y los otros alias.
   El adaptador `src/providers/totemTheme.js` convierte estos alias en la
   configuración de tipografía que necesita MUI; no hace falta modificarlo.

4. Para un único componente, probá directamente:

   ```jsx
   sx={{ fontFamily: '"Roboto", Arial, sans-serif', fontWeight: 500 }}
   ```

5. Ejecutá `npm run build` y reiniciá Electron. Probá primero cuerpo de texto
   en 400 y botones en 500/700; después decidí si reemplazar también los títulos.
   Los cambios en `lobotechAppTheme` afectan a los componentes que usan ese tema,
   incluido el panel de administración. El tema claro tiene su propia definición.

Referencia: https://mui.com/material-ui/customization/typography/

No se aplicaron estas sugerencias de paleta ni de fuente.
