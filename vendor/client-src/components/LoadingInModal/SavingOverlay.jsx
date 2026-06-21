import { Box, CircularProgress, Typography } from '@mui/material';

export const SavingOverlay = ({ message = 'Guardando cambios...' }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        bgcolor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 320,
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'primary.main',
          px: 3,
          py: 3.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 20px 70px rgba(0,0,0,0.35)',
        }}
      >
        <CircularProgress
          size={38}
          thickness={4}
          sx={{ color: 'primary.main' }}
        />

        <Typography
          sx={{
            color: 'text.primary',
            fontFamily: 'fontFamily.primary',
            fontWeight: 900,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
};
