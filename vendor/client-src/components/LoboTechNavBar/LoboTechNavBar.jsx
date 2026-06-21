import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ---- MATERIAL UI ----
import { Box, Tabs, Tab, Fade, useTheme, useMediaQuery } from '@mui/material';
// ICONS
import HomeIcon from '@mui/icons-material/Home';
// import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ContactsIcon from '@mui/icons-material/Contacts';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// ---------------------

export const LoboTechNavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const location = useLocation();

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(routes[newValue].path);
  };

  // Rutas de navegación
  const routes = [
    {
      name: 'INICIO',
      path: '/',
      icon: <HomeIcon sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />,
    },
    // {
    //   name: 'MENU DIGITAL',
    //   path: '/menu-digital',
    //   icon: (
    //     <RestaurantMenuIcon sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
    //   ),
    // },
    {
      name: 'CONTACTO',
      path: '/contact-us',
      icon: <ContactsIcon sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />,
    },
    {
      name: 'PLANES',
      path: '/pricing-plan',
      icon: (
        <AttachMoneyIcon sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
      ),
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const index = routes.findIndex((route) => route.path === currentPath);
    setValue(index >= 0 ? index : 0);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Fade in={true} timeout={1000}>
        <Box>
          <Tabs
            value={value}
            onChange={handleChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#f5a623',
                height: 3,
              },
              '& .MuiTab-root': {
                fontFamily: 'fontFamily.primary',
                fontSize: isMobile ? '0.5rem' : '1rem',
                fontWeight: 'medium',
                color: 'rgba(255,255,255,0.7)',
                transition: 'all 0.3s',
                mx: 1,
                '&:hover': {
                  color: 'white',
                },
                '&.Mui-selected': {
                  color: '#f5a623',
                  fontWeight: 'bold',
                },
              },
            }}
          >
            {routes.map((route) => (
              <Tab
                key={route.name}
                label={route.name}
                icon={route.icon}
                iconPosition="start"
                sx={{
                  minHeight: 64,
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Fade>
    </Box>
  );
};
