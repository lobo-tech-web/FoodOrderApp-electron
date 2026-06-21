import { Box, CircularProgress, Typography, Paper } from '@mui/material';

export const LoadingInModal = ({
  message = 'Cargando...',
  minHeight = 420,
}) => {
  return (
    <Box
      sx={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 360,
          px: { xs: 2.5, sm: 3 },
          py: { xs: 3, sm: 3.5 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress
          size={38}
          thickness={4}
          sx={{ color: 'primary.main' }}
        />

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              color: 'text.primary',
              fontFamily: 'fontFamily.primary',
              fontWeight: 900,
              fontSize: '0.95rem',
              textTransform: 'uppercase',
            }}
          >
            {message}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: 'text.secondary',
              fontFamily: 'fontFamily.terciary',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            Esperá unos segundos
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
