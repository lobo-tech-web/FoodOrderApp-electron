import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
} from '@mui/material';
// ICONS
import {
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- CONTEXT ----
import { useCart } from '@/context/Cart.jsx';
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- LOGO ----
import logo from '@/assets/main/icon-logo.png';
// --------------

export const ProfileUserPoints = ({ user }) => {
  const { AlertComponent, showAlert } = useAlert();
  const { clearCart } = useCart();
  const { getUserPointsByUser } = useUser();

  const [isRefreshingPoints, setIsRefreshingPoints] = useState(false);

  const navigate = useNavigate();
  const redirectMenuPage = (restaurant) => {
    clearCart(); // LIMPIAMOS EL CARRITO YA SE GUARDA EN EL LOCALSTORAGE EL DE OTRA PÁGINA ANTERIOR
    const lowerRestaurantName = restaurant.toLowerCase();
    navigate(`/menu/${lowerRestaurantName}`);
  };

  const handleRefreshPoints = useCallback(async () => {
    setIsRefreshingPoints(true);
    try {
      await getUserPointsByUser();
      showAlert('Puntos actualizados correctamente!', 'success');
    } catch (error) {
      showAlert('Error al actualizar puntos', 'error');
    } finally {
      setIsRefreshingPoints(false);
    }
  }, [getUserPointsByUser, showAlert]);

  if (isRefreshingPoints)
    return <LoadingComponent message="Actualizando puntos..." />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'fontFamily.primary',
            fontWeight: 'bold',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <StarIcon sx={{ color: 'primary.main' }} />
          MIS PUNTOS ACUMULADOS
        </Typography>

        <Tooltip title="Actualizar puntos">
          <IconButton
            onClick={handleRefreshPoints}
            disabled={isRefreshingPoints}
            sx={{
              bgcolor: 'primary.main',
              color: 'text.terciary',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'action.disabled',
              },
            }}
          >
            <RefreshIcon
              sx={{
                animation: isRefreshingPoints
                  ? 'spin 1s linear infinite'
                  : 'none',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {user?.points && user?.points?.length ? (
        <Stack spacing={3}>
          {user.points.map((userPoints, index) => (
            <Card
              key={userPoints.id}
              elevation={4}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                bgcolor: '#000',
                color: 'primary.main',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* Layout horizontal */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 140,
                    position: 'relative',
                  }}
                >
                  {/* Lado izquierdo - Logo del restaurante */}
                  <Box
                    sx={{
                      width: { xs: 120, sm: 150 },
                      height: 140,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      gap: 1,
                    }}
                  >
                    <Avatar
                      src={logo}
                      alt="Lobotech"
                      sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    />
                  </Box>

                  {/* Lado derecho - Información */}
                  <Box
                    sx={{
                      flex: 1,
                      p: { xs: 2, sm: 3 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 140,
                    }}
                  >
                    {/* Header de la tarjeta */}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'fontFamily.primary',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          mb: 0.5,
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                      >
                        {userPoints?.restaurantName}
                      </Typography>
                    </Box>

                    {/* Contenido principal */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        gap: 2,
                      }}
                    >
                      {/* Puntos disponibles */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <StarIcon
                          sx={{
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            color: 'primary.main',
                          }}
                        />
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'fontFamily.secondary',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              lineHeight: 1,
                              color: 'white',
                            }}
                          >
                            Puntos disponibles
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontFamily: 'fontFamily.primary',
                              fontWeight: 'bold',
                              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              fontSize: { xs: '1.5rem', sm: '2rem' },
                              lineHeight: 1,
                            }}
                          >
                            {userPoints.points}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Botón de visitar */}
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          redirectMenuPage(userPoints.restaurantName);
                        }}
                        sx={{
                          background:
                            'linear-gradient(45deg, #f5a623 30%, #f8e71c 90%)',
                          color: '#000',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 3,
                          fontFamily: 'fontFamily.terciary',
                          fontWeight: 'bold',
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.75, sm: 1 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          minWidth: { xs: 90, sm: 110 },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        Visitar
                      </Button>
                    </Box>
                  </Box>
                </Box>

                {/* Efectos decorativos */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    left: -20,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: { xs: 2, sm: 4 },
          }}
        >
          <StarIcon
            sx={{
              fontSize: '4rem',
              color: 'text.secondary',
              mb: 2,
              opacity: 0.5,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.primary',
              mb: 1,
            }}
          >
            No tienes puntos acumulados
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: 'text.secondary',
              maxWidth: 400,
            }}
          >
            Comienza a acumular puntos realizando pedidos en nuestros
            restaurantes asociados
          </Typography>
        </Box>
      )}
      {AlertComponent}
    </Box>
  );
};
