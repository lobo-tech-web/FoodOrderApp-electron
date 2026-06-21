import { useState, useEffect } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Typography,
  Container,
  Grid,
  Fade,
  Grow,
  ThemeProvider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
// ---------------------

// ---- THEME ----
import { lobotechAppTheme } from '@/theme/main-theme.js';
// ---------------

// ---- LOGO ----
import toroburgerlogo from '@/assets/toro-burger/logo_toro.png';
// --------------

// ---- COMPONENTS ----
import { MainNavBar } from '@/components/MainNavBar/MainNavBar.jsx';
import { LoboTechNavBar } from '@/components/LoboTechNavBar/LoboTechNavBar.jsx';
import { ClientCard } from './ClientCard/ClientCard.jsx';
import { Footer } from '../Footer/Footer.jsx';
// --------------------

// ---- LISTA DE CLIENTES ----
const myClients = [
  {
    name: 'TORO BURGER',
    location: '9 de julio - BS AS',
    logo: toroburgerlogo,
    route: '/menu/toro-burger',
  },
];
// ---------------------------

export const MenuPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showContent, setShowContent] = useState(false);

  // Animación de entrada
  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <ThemeProvider theme={lobotechAppTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.main',
        }}
      >
        <MainNavBar title={'LOBOTECH'} />

        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            py: { xs: 4, md: 6 },
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Fade in={showContent} timeout={1000}>
              <Box>
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    color: 'white',
                    fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  MENU DIGITAL
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.secondary',
                    fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' },
                    mb: 1,
                    maxWidth: '800px',
                    mx: 'auto',
                  }}
                >
                  Explora nuestros clientes y descubre cómo transformamos su
                  experiencia gastronómica
                </Typography>
              </Box>
            </Fade>
          </Container>

          {/* Círculos decorativos */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(245,166,35,0.1) 0%, rgba(245,166,35,0) 70%)',
              zIndex: 0,
              display: { xs: 'none', md: 'block' },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              right: '5%',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(245,166,35,0.1) 0%, rgba(245,166,35,0) 70%)',
              zIndex: 0,
              display: { xs: 'none', md: 'block' },
            }}
          />
        </Box>

        {/* Navigation Bar */}
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', py: 1 }}>
          <LoboTechNavBar theme={lobotechAppTheme} />
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 4 }, flexGrow: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'fontFamily.terciary',
              color: 'white',
              fontSize: { xs: '1.5rem', sm: '1.5rem', md: '2rem' },
              textAlign: 'center',
              mb: 4,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '3px',
                backgroundColor: 'primary.main',
              },
            }}
          >
            NUESTROS CLIENTES
          </Typography>

          <Grid>
            {myClients?.map((client, index) => (
              <Box key={index}>
                <Grow in={showContent} timeout={1000 + index * 300}>
                  <Box>
                    <ClientCard
                      name={client?.name}
                      location={client?.location}
                      logo={client?.logo}
                      route={client?.route}
                    />
                  </Box>
                </Grow>
              </Box>
            ))}
          </Grid>
        </Container>

        {/* Footer */}
        <Footer />
      </Box>
    </ThemeProvider>
  );
};
