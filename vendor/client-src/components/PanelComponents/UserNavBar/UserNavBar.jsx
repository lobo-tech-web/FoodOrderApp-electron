import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemButton,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Fade,
} from '@mui/material';
// ICONS
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
// ---------------------

// ---- STYLES ----
const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  px: 2,
  py: 1,
  borderRadius: 2,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'fontFamily.secondary',
  fontSize: '0.95rem',
  fontWeight: '500',
  textDecoration: 'none',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
};

const activeNavItemStyle = {
  ...navItemStyle,
  bgcolor: 'primary.main',
  color: 'text.terciary',
  fontWeight: '600',
  '& .MuiSvgIcon-root': {
    color: 'text.terciary',
  },
};

const inactiveNavItemStyle = {
  ...navItemStyle,
  color: 'text.primary',
  '& .MuiSvgIcon-root': {
    color: 'text.primary',
  },
};
// ----------------

export const UserNavBar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (path) => location.pathname === path;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ESTADOS
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  // Cerrar sesión
  const handleLogout = () => {
    setDrawerOpen(false);
    onLogout();
    navigate('/');
  };

  const NavItem = ({ icon, text, path, onClick, isActive = false }) => (
    <Box
      component="div"
      onClick={onClick || (() => handleNavigate(path))}
      sx={isActive ? activeNavItemStyle : inactiveNavItemStyle}
    >
      {icon}
      <Typography variant="body2" component="span">
        {text}
      </Typography>
    </Box>
  );

  const drawerItems = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.main',
      }}
      role="presentation"
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'flex-end',
        }}
      >
        <IconButton
          onClick={toggleDrawer(false)}
          size="small"
          sx={{ color: 'primary.main' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ flexGrow: 1, overflowY: 'auto', pt: 0 }}>
        {/* BOTÓN ATRÁS */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate(-1)} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <ArrowBackIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Volver"
              primaryTypographyProps={{
                fontFamily: 'fontFamily.secondary',
                color: 'primary.main',
              }}
            />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ bgcolor: 'text.primary' }} />

        {/* ROLE: ADMIN */}
        {user.role === 'admin' && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/control-panel')}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  borderRight: '4px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Panel de Control"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'primary.main',
                }}
              />
            </ListItemButton>
          </ListItem>
        )}

        {/* ROLE: DEV */}
        {user.role === 'dev' && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/dev-control-panel')}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  borderRight: '4px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
              }}
            >
              <ListItemIcon>
                <CodeIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Dev - Panel de Control"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'primary.main',
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigate('/account')}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                borderRight: '4px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              },
            }}
          >
            <ListItemIcon>
              <PersonIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Ver Perfil"
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'primary.main',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
      {/* CERRAR SESIÓN */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'text.primary' }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            py: 1,
            fontFamily: 'fontFamily.terciary',
            fontWeight: 'bold',
            borderRadius: 2,
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Fade in={showAnimation} timeout={800}>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'primary.dark',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 1, sm: 2 },
            py: 0.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontFamily: 'fontFamily.terciary',
              color: 'primary.main',
              ml: 1,
            }}
          >
            {user.businessName || user.email}
          </Typography>

          {/* Drawer - visible en XS/SM */}
          {isMobile && (
            <Box sx={{ display: 'flex' }}>
              <IconButton
                color="primary"
                onClick={toggleDrawer(true)}
                size="large"
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                {drawerItems}
              </Drawer>
            </Box>
          )}

          {/* MENÚ PARA PC */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* VOLVER ATRÁS */}
              <NavItem
                icon={<ArrowBackIcon />}
                text="Volver"
                onClick={() => navigate(-1)}
              />

              {/* PERFIL DEL USUARIO */}
              <NavItem
                icon={<PersonIcon />}
                text="Ver Perfil"
                path="/account"
                isActive={isActiveRoute('/account')}
              />

              {/* ADMIN */}
              {user.role === 'admin' && (
                <NavItem
                  icon={<DashboardIcon />}
                  text="Panel de Control"
                  path="/control-panel"
                  isActive={isActiveRoute('/control-panel')}
                />
              )}

              {/* DEV */}
              {user.role === 'dev' && (
                <NavItem
                  icon={<CodeIcon />}
                  text="Dev - Panel de Control"
                  path="/dev-control-panel"
                  isActive={isActiveRoute('/dev-control-panel')}
                />
              )}

              {/* CERRAR SESIÓN */}
              <NavItem
                icon={<LogoutIcon />}
                text="Cerrar sesión"
                onClick={handleLogout}
              />
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Fade>
  );
};
