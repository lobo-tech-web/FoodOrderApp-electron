import {
  lobotechAppTheme,
  lobotechAppThemeLight,
  lobotechAppThemeDarkBlue,
} from "./main-theme.js";

export const themes = {
  dark: lobotechAppTheme,
  light: lobotechAppThemeLight,
  darkBlue: lobotechAppThemeDarkBlue,
};

const themeLabels = {
  dark: "Oscuro",
  light: "Claro",
  darkBlue: "Azul Oscuro",
};

export const isValidTheme = (value) =>
  Object.prototype.hasOwnProperty.call(themes, value);

export const availableThemeOptions = Object.keys(themes).map((value) => ({
  value,
  label: themeLabels[value] || value,
}));
