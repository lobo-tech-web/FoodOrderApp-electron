// ---- MATERIAL UI ----
import {
  Box,
  CircularProgress,
  Typography,
  ThemeProvider,
} from '@mui/material';
// --------------------

// ---- CONTEXT ----
import { useLobotechThemeContext } from '@/context/ThemeContext.jsx';
// ---------------

export const LoadingComponent = ({ message = 'Cargando...', theme }) => {
  const { lobotechTheme } = useLobotechThemeContext();

  return (
    <ThemeProvider theme={theme ? theme : lobotechTheme}>
      <Box
        sx={{
          bgcolor: 'loading.background' || 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'loading.main',
            marginBottom: 2,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'loading.main',
          }}
        >
          {message}
        </Typography>
      </Box>
    </ThemeProvider>
  );
};
