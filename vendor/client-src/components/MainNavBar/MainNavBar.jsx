import { useState, useMemo, useCallback } from 'react';

// ---- MATERIAL UI ----
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  Fade,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ICONS
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
// <---------------------

// ---- FONT-AWESOME ----
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
// ----------------------

// ---- COMPONENTS ----
import { UserMenuItems } from './UserMenuItems.jsx';
// --------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
import { useLoginModal } from '@/context/LoginContext.jsx';
import { useRegisterModal } from '@/context/RegisterContext.jsx';
// -----------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

export const MainNavBar = ({ customIcon, title, restaurantId }) => {
  // DETECTAMOS SI EL USUARIO ESTA EN MÓVIL
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { AlertComponent, showAlert } = useAlert();

  const [anchorEl, setAnchorEl] = useState(null); // Estado para controlar el menú
  const open = Boolean(anchorEl); // Verificar si el menú está abierto
  const [isRefreshingPoints, setIsRefreshingPoints] = useState(false);

  const { userState, userLogOut, getUserPointsByUser } = useUser();
  const user = useMemo(() => userState.user || {}, [userState.user]);

  // Obtener los puntos del usuario para el restaurante actual
  const userPoints = useMemo(() => {
    return userState?.user?.points?.find(
      (point) => point.restaurantId === restaurantId
    );
  }, [userState?.user?.points, restaurantId]);

  // ESTADOS PARA LOS MODALES
  const { openLoginModal } = useLoginModal();
  const { openRegisterModal } = useRegisterModal();

  // Función para abrir el menú
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // ABRIR/CERRAR MODALES/MENU
  const handleMenuClose = (action = null) => {
    setAnchorEl(null);
    if (action === 'login') openLoginModal();
    if (action === 'register') openRegisterModal();
  };

  const handleRefreshPoints = useCallback(async () => {
    if (!user?.id) return;

    setIsRefreshingPoints(true);
    try {
      await getUserPointsByUser();
      showAlert('Puntos actualizados correctamente!', 'success', theme);
    } catch (error) {
      showAlert('Error al actualizar puntos', 'error', theme);
    } finally {
      setIsRefreshingPoints(false);
    }
  }, [user?.id, getUserPointsByUser]);

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 1, sm: 2 },
          py: 1,
        }}
      >
        {/* NOMBRE DE USUARIOS CON LOS PUNTOS */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          {user.name && (
            <Typography
              variant={isMobile ? 'body2' : 'body1'}
              sx={{
                fontFamily: 'fontFamily.terciary',
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              <PersonIcon
                sx={{
                  color: 'text.primary',
                  fontSize: isMobile ? '1rem' : '1.5rem',
                }}
              />
              {user.name}
            </Typography>
          )}

          {userPoints && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.3,
              }}
            >
              <FontAwesomeIcon
                icon={customIcon || faStar}
                style={{
                  color: 'text.primary',
                  fontSize: isMobile ? '0.8rem' : '1.2rem',
                }}
              />
              <Typography
                variant={isMobile ? 'body2' : 'body1'}
                sx={{ fontFamily: 'fontFamily.terciary' }}
              >
                {userPoints.points > 0 ? userPoints.points : 0} pts.{' '}
              </Typography>
            </Box>
          )}
        </Box>

        {/* TITULO DEL RESTAURANTE */}

        {!user.name && (
          <Typography
            variant={isMobile ? 'body1' : 'h5'}
            component="h1"
            sx={{
              fontFamily: 'fontFamily.primary',
              textAlign: 'center',
              color: 'text.primary',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {title}
          </Typography>
        )}

        {/* IconButton para abrir el menú */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton
            color="primary"
            onClick={handleMenuOpen}
            sx={{
              paddingRight: isMobile ? '20px' : '50px',
              backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
              borderRadius: isMobile ? '50%' : '4px',
              '&:hover': {
                backgroundColor: isMobile
                  ? 'rgba(0, 0, 0, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <MenuIcon fontSize={'medium'} />
          </IconButton>
        </Box>

        {/* Menú desplegable */}
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          transitionDuration={250}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              bgcolor: 'navbarmenu.background',
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              overflow: 'visible',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
        >
          <UserMenuItems
            user={user}
            userPoints={userPoints}
            customIcon={customIcon}
            handleMenuClose={handleMenuClose}
            userLogOut={userLogOut}
            onRefreshPoints={handleRefreshPoints}
            isRefreshingPoints={isRefreshingPoints}
          />
        </Menu>
      </Toolbar>
      {AlertComponent}
    </AppBar>
  );
};
