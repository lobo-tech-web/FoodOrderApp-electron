// ---- MATERIAL UI ----
import { Box, Switch, Tooltip, Typography } from "@mui/material";
// ICONS
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
// ---------------------

// ---- CONTEXT ----
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
// -----------------

export const ThemeToggle = ({ size = "medium", showLabel = false }) => {
  const { currentTheme, toggleTheme } = useLobotechThemeContext();

  const isDark = currentTheme === "dark";
  const isSmall = size === "small";

  return (
    <Tooltip
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      arrow
      placement="bottom"
    >
      <Box
        component="label"
        role="group"
        aria-label="Selector de tema"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.6,
          px: isSmall ? 1 : 1.25,
          py: isSmall ? 0.35 : 0.5,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
          cursor: "pointer",
          userSelect: "none",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "action.hover",
          },
        }}
      >
        {/* CLARO */}

        <LightModeIcon
          sx={{
            fontSize: isSmall ? 17 : 20,
            color: !isDark ? "warning.main" : "text.disabled",
            opacity: !isDark ? 1 : 0.55,
            transition: "all 0.2s ease",
          }}
        />

        {/* SWITCH */}

        <Switch
          checked={isDark}
          onChange={() => toggleTheme()}
          size={size}
          color="primary"
          inputProps={{
            "aria-label": isDark
              ? "Cambiar a tema claro"
              : "Cambiar a tema oscuro",
          }}
          sx={{
            mx: -0.3,
            "& .MuiSwitch-thumb": {
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            },
          }}
        />

        {/* OSCURO */}

        <DarkModeIcon
          sx={{
            fontSize: isSmall ? 17 : 20,
            color: isDark ? "primary.main" : "text.disabled",
            opacity: isDark ? 1 : 0.55,
            transition: "all 0.2s ease",
          }}
        />

        {/* LABEL */}

        {showLabel && (
          <Typography
            component="span"
            sx={{
              ml: 0.4,
              minWidth: isSmall ? 52 : 62,
              fontFamily: "fontFamily.primary",
              fontWeight: 700,
              fontSize: isSmall ? 10 : 11,
              letterSpacing: "0.04em",
              color: "text.primary",
              lineHeight: 1,
            }}
          >
            {isDark ? "OSCURO" : "CLARO"}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};
