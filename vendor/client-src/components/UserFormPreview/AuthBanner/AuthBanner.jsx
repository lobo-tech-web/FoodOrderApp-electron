// ---- MATERIAL UI ----
import { Box, Typography, Button, Paper, Stack, Chip } from '@mui/material';
// ICONS
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon,
} from '@mui/icons-material';
// ---------------------

export const AuthBanner = ({
  onLogin,
  onRegister,
  totalRewardPoints,
  isMobile,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        borderRadius: 3,
        bgcolor: 'background.default',
        border: '2px solid',
        borderColor: 'primary.main',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          {/* Título principal */}
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontFamily: 'fontFamily.terciary',
              color: 'primary.main',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <PersonAddIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
            ¡Registrate y obtene beneficios!
          </Typography>

          {/* Beneficios */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
          >
            <Chip
              icon={<StarIcon />}
              label={`Gana ${totalRewardPoints} puntos con este pedido`}
              color="primary"
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
              sx={{
                fontFamily: 'fontFamily.secondary',
                '& .MuiChip-label': {
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                },
              }}
            />
            <Chip
              label="Historial de pedidos"
              color="primary"
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
              sx={{
                fontFamily: 'fontFamily.secondary',
                '& .MuiChip-label': {
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                },
              }}
            />
            <Chip
              label="Tus datos guardados"
              color="primary"
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
              sx={{
                fontFamily: 'fontFamily.secondary',
                '& .MuiChip-label': {
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                },
              }}
            />
          </Stack>

          {/* Descripción */}
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: 'text.primary',
              maxWidth: '600px',
              lineHeight: 1.5,
            }}
          >
            Crea una cuenta o inicia sesión para acumular puntos, guardar tus
            datos y acceder a tu historial de pedidos. ¡Es rápido y fácil!
          </Typography>

          {/* Botones de acción */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ width: '100%', maxWidth: '400px' }}
          >
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={onLogin}
              sx={{
                fontFamily: 'fontFamily.secondary',
                fontSize: { xs: '0.875rem', md: '1rem' },
                bgcolor: 'primary.main',
                color: 'text.secondary',
                py: { xs: 1, md: 1.5 },
                borderRadius: 2,
                flex: 1,
                boxShadow: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'primary.secondary',
                  color: 'text.primary',
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              Iniciar Sesión
            </Button>

            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={onRegister}
              sx={{
                fontFamily: 'fontFamily.secondary',
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: 'primary.main',
                borderColor: 'primary.main',
                borderWidth: 2,
                py: { xs: 1, md: 1.5 },
                borderRadius: 2,
                flex: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.main',
                  color: 'text.secondary',
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Registrarse
            </Button>
          </Stack>

          {/* Nota adicional */}
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: 'text.secondary',
              fontStyle: 'italic',
              mt: 1,
            }}
          >
            También puedes continuar como invitado sin crear una cuenta
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};
