// ---- MATERIAL UI ----
import { Box, Alert, Typography, Chip } from '@mui/material';
// ICONS
import PreviewIcon from '@mui/icons-material/Preview';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
// ---------------------

export const ChangesPreview = ({ incrementDecrement, porcentage, around }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Alert
        severity="info"
        icon={<PreviewIcon />}
        color="primary"
        sx={{
          mb: 2,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: 'fontFamily.primary' }}>
            VISTA PREVIA DE CAMBIOS
          </Typography>
          <Chip
            icon={
              incrementDecrement === 'AUMENTAR' ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )
            }
            label={`${incrementDecrement} ${porcentage}%`}
            color={incrementDecrement === 'AUMENTAR' ? 'success' : 'warning'}
            size="small"
            sx={{ fontFamily: 'fontFamily.secondary' }}
          />
        </Box>
        <Typography variant="body2" sx={{ fontFamily: 'fontFamily.secondary' }}>
          Configuración: {around}
        </Typography>
      </Alert>
    </Box>
  );
};
