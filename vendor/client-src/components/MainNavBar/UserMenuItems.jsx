import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  Box,
  Typography,
  MenuItem,
  Divider,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
// ICONS
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/Star';
// <------------------

// ---- FONT-AWESOME ----
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
// ----------------------

export const UserMenuItems = ({
  user,
  userPoints,
  customIcon,
  handleMenuClose,
  userLogOut,
  onRefreshPoints,
  isRefreshingPoints,
}) => {
  const navigate = useNavigate();

  const handleRefreshPoints = async () => {
    if (onRefreshPoints) {
      try {
        await onRefreshPoints();
      } catch (error) {
        console.error('Error al actualizar puntos:', error);
        alert('Error al actualizar los puntos. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <Box>
      {user && user.id ? (
        <Box>
          <Box sx={{ p: 2, pb: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 1,
              }}
            >
              {/* NOMBRE DE USUARIO */}
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'fontFamily.terciary',
                  color: 'navbarmenu.text',
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </Typography>

              <Box>
                {/* PTOS DEL USUARIO */}
                {userPoints ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1,
                      borderRadius: 1,
                    }}
                  >
                    {/* ICONO DE LOS PUNTOS */}
                    <FontAwesomeIcon
                      icon={customIcon || faStar}
                      style={{ color: 'navbarmenu.text' }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        color: 'navbarmenu.text',
                      }}
                    >
                      {userPoints?.points > 0 ? userPoints?.points : 0} pts.
                    </Typography>

                    {/* ACTUALIZAR PUNTOS */}
                    {isRefreshingPoints ? (
                      <CircularProgress
                        size={20}
                        sx={{ color: 'navbarmenu.text' }}
                      />
                    ) : (
                      <RefreshIcon
                        fontSize="small"
                        sx={{
                          color: 'navbarmenu.text',
                          '&:hover': { cursor: 'pointer' },
                        }}
                        onClick={handleRefreshPoints}
                      />
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1,
                      borderRadius: 1,
                    }}
                  >
                    {/* ICONO DE LOS PUNTOS */}
                    <FontAwesomeIcon
                      icon={customIcon || faStar}
                      style={{ color: 'navbarmenu.text' }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        color: 'navbarmenu.text',
                      }}
                    >
                      Sin puntos de local
                    </Typography>

                    {/* ACTUALIZAR PUNTOS */}
                    {isRefreshingPoints ? (
                      <CircularProgress
                        size={20}
                        sx={{ color: 'navbarmenu.text' }}
                      />
                    ) : (
                      <RefreshIcon
                        fontSize="small"
                        sx={{
                          color: 'navbarmenu.text',
                          '&:hover': { cursor: 'pointer' },
                        }}
                        onClick={handleRefreshPoints}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* PERFIL DE USUARIO */}
          <MenuItem
            onClick={() => {
              navigate('/account');
              handleMenuClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: 'navbarmenu.text' }} />
            </ListItemIcon>
            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'navbarmenu.text',
              }}
            >
              Mi Perfil
            </Typography>
          </MenuItem>
          {/* MENU DESPLEGABLE PARA ADMIN */}
          {user.role === 'admin' && (
            <MenuItem
              onClick={() => navigate('/control-panel')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <DashboardIcon
                  fontSize="small"
                  sx={{ color: 'navbarmenu.text' }}
                />
              </ListItemIcon>
              <Typography
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'navbarmenu.text',
                }}
              >
                Panel de Control
              </Typography>
            </MenuItem>
          )}
          {/* MENU DESPLEGABLE PARA DEV */}
          {user.role === 'dev' && (
            <MenuItem
              onClick={() => navigate('/dev-control-panel')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <CodeIcon fontSize="small" sx={{ color: 'navbarmenu.text' }} />
              </ListItemIcon>
              <Typography
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'navbarmenu.text',
                }}
              >
                Dev Panel
              </Typography>
            </MenuItem>
          )}
          <Divider />

          {/* BOTÓN PARA DESLOGUEAR */}
          <MenuItem
            onClick={() => {
              userLogOut();
              handleMenuClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'error.main',
              }}
            >
              Cerrar Sesión
            </Typography>
          </MenuItem>

          <Divider />
          {/* BOTON DE LOBOTECH */}
          <MenuItem onClick={() => navigate('/')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <StarIcon fontSize="small" sx={{ color: 'navbarmenu.text' }} />
            </ListItemIcon>
            <Typography
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: 'navbarmenu.text',
              }}
            >
              LOBOTECH
            </Typography>
          </MenuItem>
        </Box>
      ) : (
        <Box>
          <Box sx={{ p: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: 'navbarmenu.text',
                mb: 1,
              }}
            >
              ¡Bienvenido!
            </Typography>
          </Box>

          <Divider />
          {/* BOTON DE INICIO DE SESIÓN */}
          <MenuItem onClick={() => handleMenuClose('login')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <LoginIcon fontSize="small" sx={{ color: 'navbarmenu.text' }} />
            </ListItemIcon>
            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'navbarmenu.text',
              }}
            >
              Iniciar Sesión
            </Typography>
          </MenuItem>

          {/* BOTON DE REGISTRO */}
          <MenuItem
            onClick={() => handleMenuClose('register')}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <HowToRegIcon
                fontSize="small"
                sx={{ color: 'navbarmenu.text' }}
              />
            </ListItemIcon>
            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'navbarmenu.text',
              }}
            >
              Registrarse
            </Typography>
          </MenuItem>

          <Divider />
          {/* BOTON DE LOBOTECH */}
          <MenuItem onClick={() => navigate('/')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <StarIcon fontSize="small" sx={{ color: 'navbarmenu.text' }} />
            </ListItemIcon>
            <Typography
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: 'navbarmenu.text',
              }}
            >
              LOBOTECH
            </Typography>
          </MenuItem>
        </Box>
      )}
    </Box>
  );
};
