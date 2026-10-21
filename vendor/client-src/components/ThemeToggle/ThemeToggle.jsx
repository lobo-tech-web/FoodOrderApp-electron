// ---- Material UI ----
import { Box, MenuItem, Select, Typography } from "@mui/material";
// Icons
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Context ----
import { useLobotechThemeContext } from "@/context/lobotechThemeContext.js";
import { availableThemeOptions } from "@/theme/themeRegistry.js";
// -----------------

export const ThemeToggle = ({ size = "medium", showLabel = false }) => {
  const { currentTheme, setTheme, lobotechTheme } = useLobotechThemeContext();
  const isSmall = size === "small";
  const ThemeIcon =
    lobotechTheme.palette.mode === "light" ? LightModeIcon : DarkModeIcon;

  return (
    <Box sx={{ width: "100%", maxWidth: 200, minWidth: 0 }}>
      {showLabel && (
        <Typography
          component="div"
          sx={{
            fontFamily: "fontFamily.secondary",
            mb: 0.5,
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          Tema de la aplicación
        </Typography>
      )}

      <Select
        fullWidth
        size={size}
        value={currentTheme}
        onChange={(event) => setTheme(event.target.value)}
        inputProps={{ "aria-label": "Tema de la aplicación" }}
        renderValue={(value) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ThemeIcon
              sx={{ fontSize: isSmall ? 18 : 20, color: "primary.main" }}
            />
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                fontSize: { xs: "0.8rem", md: "0.85rem" },
              }}
            >
              {
                availableThemeOptions.find((option) => option.value === value)
                  ?.label
              }
            </Typography>
          </Box>
        )}
        sx={{ bgcolor: "background.default", borderRadius: 2 }}
      >
        {availableThemeOptions.map(({ value, label }) => (
          <MenuItem
            key={value}
            value={value}
            sx={{
              fontFamily: "fontFamily.secondary",
              fontSize: { xs: "0.7rem", md: "0.8rem" },
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
