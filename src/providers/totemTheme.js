import { createTheme } from "@mui/material";

const variants = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "subtitle1", "subtitle2", "body1", "body2", "button", "caption", "overline",
];

export const createTotemTheme = (appTheme) => {
  const fonts = appTheme.typography.fontFamily;
  const bodyFont = typeof fonts === "string"
    ? fonts
    : fonts?.secondary || "Arial, sans-serif";
  const titleFont = typeof fonts === "string"
    ? fonts
    : fonts?.primary || bodyFont;

  return createTheme({
    ...appTheme,
    // MUI necesita una fuente por defecto en string; sx conserva los alias existentes.
    typographyAliases: {
      ...appTheme.typography,
      fontFamily: typeof fonts === "string"
        ? { primary: fonts, secondary: fonts, terciary: fonts }
        : fonts,
    },
    unstable_sxConfig: {
      ...appTheme.unstable_sxConfig,
      fontFamily: { themeKey: "typographyAliases" },
    },
    typography: {
      ...appTheme.typography,
      fontFamily: bodyFont,
      ...Object.fromEntries(variants.map((variant) => [variant, {
        ...appTheme.typography[variant],
        fontFamily: variant.startsWith("h") || variant === "button"
          ? titleFont
          : bodyFont,
      }])),
    },
  });
};
