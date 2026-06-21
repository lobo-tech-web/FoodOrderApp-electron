// ---- MATERIAL UI ----
import { IconButton, Tooltip, Box } from '@mui/material';
// ICONS
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
// ---------------------

// ---- CONTEXT ----
import { useLobotechThemeContext } from '@/context/ThemeContext.jsx';
// -----------------

export const ThemeToggle = ({ size = 'medium', showLabel = false }) => {
  const { currentTheme, toggleTheme } = useLobotechThemeContext();

  const isDark = currentTheme === 'dark';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}>
        <IconButton
          onClick={toggleTheme}
          size={size}
          sx={{
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {isDark ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Tooltip>
      {showLabel && (
        <Box
          component="span"
          sx={{
            fontFamily: 'fontFamily.primary',
            fontSize: '1rem',
            color: 'primary.main',
            userSelect: 'none',
          }}
        >
          {isDark ? 'TEMA OSCURO' : 'TEMA CLARO'}
        </Box>
      )}
    </Box>
  );
};
