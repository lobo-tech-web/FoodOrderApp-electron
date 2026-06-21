import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  ThemeProvider,
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Fade,
  Grow,
  Divider,
  Paper,
} from '@mui/material';
// ICONS
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import StarIcon from '@mui/icons-material/Star';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// ---------------------

// ---- LOGO ----
import mainLogo from '@/assets/main/logo-white.png';
// --------------

// ---- THEME ----
import { lobotechAppTheme } from '@/theme/main-theme.js';
// ---------------

// ---- COMPONENTS ----
import { MainNavBar } from '@/components/MainNavBar/MainNavBar.jsx';
import { LoboTechNavBar } from '@/components/LoboTechNavBar/LoboTechNavBar.jsx';
import { Footer } from '../Footer/Footer.jsx';
// --------------------

export const MainPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [showContent, setShowContent] = useState(false);

  // Características principales con iconos
  const features = [
    {
      icon: <RestaurantMenuIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Menú Digital Interactivo',
      description:
        'Ofrece a tus clientes una experiencia moderna con nuestro menú digital interactivo. Actualiza precios y productos en tiempo real.',
    },
    {
      icon: <StarIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Sistema de Fidelización',
      description:
        'Premia a tus clientes frecuentes con nuestro sistema de puntos. Aumenta las ventas recurrentes y la satisfacción del cliente.',
    },
    {
      icon: <PhoneIphoneIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Experiencia Móvil Optimizada',
      description:
        'Diseño responsive que funciona perfectamente en cualquier dispositivo. Tus clientes pueden hacer pedidos desde donde estén.',
    },
    {
      icon: <AnalyticsIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Gestión de Pedidos',
      description:
        'Administra tus pedidos de forma eficiente y mantén un registro completo de todas las transacciones.',
    },
  ];

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
          overflow: 'hidden',
        }}
      >
        <MainNavBar title={'LOBOTECH'} />

        {/* Hero Section */}

        <Box
          sx={{
            position: 'relative',
            py: { xs: 6, md: 10 },
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Fade in={showContent} timeout={1000}>
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    color: 'white',
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  LOBOTECH
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.secondary',
                    mb: 4,
                    maxWidth: '800px',
                    mx: 'auto',
                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.5rem' },
                  }}
                >
                  Transformando la experiencia gastronómica con tecnología de
                  vanguardia
                </Typography>

                <Box
                  component="img"
                  src={mainLogo}
                  alt="LOBOTECH Logo"
                  sx={{
                    width: { xs: '200px', sm: '250px', md: '300px' },
                    height: 'auto',
                    mb: 4,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                      },
                      '50%': {
                        transform: 'scale(1.05)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                      },
                    },
                  }}
                />

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/contact-us')}
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    py: 1.5,
                    px: 4,
                    borderRadius: 8,
                    background:
                      'linear-gradient(45deg, #f5a623 30%, #f8e71c 90%)',
                    color: '#000',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 20px rgba(245, 166, 35, 0.5)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 25px rgba(245, 166, 35, 0.6)',
                    },
                  }}
                >
                  SOLICITAR INFO
                </Button>
              </Box>
            </Fade>
          </Container>

          {/* Círculos decorativos */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: '300px',
              height: '300px',
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
              width: '250px',
              height: '250px',
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
          {/* LOBOTECH NAVBAR */}
          <LoboTechNavBar theme={lobotechAppTheme} />
        </Box>

        {/* About Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Grow in={showContent} timeout={1500}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      color: 'white',
                      mb: 3,
                      position: 'relative',
                      display: 'inline-block',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-10px',
                        left: 0,
                        width: '60px',
                        height: '4px',
                        backgroundColor: 'primary.main',
                      },
                    }}
                  >
                    ¿QUE ES LOBOTECH?
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      color: 'white',
                      mb: 4,
                      lineHeight: 1.6,
                    }}
                  >
                    Somos una empresa especializada en soluciones tecnológicas
                    para el sector gastronómico.
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      color: 'white',
                      mb: 4,
                      lineHeight: 1.6,
                    }}
                  >
                    Nuestro sistema de menú digital revoluciona la forma en que
                    tus clientes se puedan interactuar de manera óptima y
                    aumentando su satisfacción.
                  </Typography>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/menu-digital')}
                    sx={{
                      fontFamily: 'fontFamily.primary',
                      color: '#000',
                      background:
                        'linear-gradient(45deg, #f5a623 30%, #f8e71c 90%)',
                      borderColor: '#000',
                      borderWidth: 2,
                      borderRadius: 4,
                      px: 3,
                      py: 1,
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateX(5px)',
                      },
                    }}
                  >
                    VER EJEMPLOS
                  </Button>
                </Box>
              </Grow>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grow in={showContent} timeout={2000}>
                <Paper
                  elevation={10}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      color: '#FFF',
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    BENEFICIOS
                  </Typography>
                  <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {[
                      'Aumenta tus ventas hasta un 25%',
                      'Reduce errores en los pedidos',
                      'Fideliza a tus clientes con puntos',
                      'Actualiza tu menú en tiempo real',
                      'Recibe pedidos automáticamente por WhatsApp y en tu Panel de Control',
                      'Informamos a tus clientes sobre el estado de su pedido al actualizarse',
                    ].map((benefit, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: '#f5a623',
                            color: '#000',
                            transform: 'translateX(5px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 30,
                            height: 30,
                            borderRadius: '50%',
                            bgcolor: '#f5a623',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            color: '#000',
                            fontWeight: 'bold',
                          }}
                        >
                          ✓
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'white',
                            fontWeight: 'medium',
                          }}
                        >
                          {benefit}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grow>
            </Grid>
          </Grid>
        </Container>

        {/* Features Section */}
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', py: { xs: 4, md: 8 } }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: 'white',
                textAlign: 'center',
                mb: 6,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '4px',
                  backgroundColor: 'primary.main',
                },
              }}
            >
              CARACTERÍSTICAS PRINCIPALES
            </Typography>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Grow in={showContent} timeout={1000 + index * 500}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.3)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          display: 'flex',
                          justifyContent: 'center',
                          bgcolor: 'rgba(245,166,35,0.1)',
                        }}
                      >
                        <Box
                          sx={{
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {feature.icon}
                        </Box>
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontFamily: 'fontFamily.primary',
                            color: 'white',
                            mb: 2,
                            textAlign: 'center',
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'rgba(255,255,255,0.7)',
                            textAlign: 'center',
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
          <Fade in={showContent} timeout={2500}>
            <Paper
              elevation={10}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                background:
                  'linear-gradient(135deg, rgba(245,166,35,0.2) 0%, rgba(245,166,35,0.1) 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.05,
                  backgroundImage: `url(${mainLogo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    color: 'white',
                    mb: 2,
                  }}
                >
                  ¿LISTO PARA TRANSFORMAR TU NEGOCIO?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'rgba(255,255,255,0.8)',
                    mb: 4,
                    maxWidth: '700px',
                    mx: 'auto',
                  }}
                >
                  Únete a los gastronómicos que ya están mejorando su servicio y
                  aumentando sus ventas con nuestras soluciones digitales.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/contact-us')}
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    py: 1.5,
                    px: 4,
                    borderRadius: 8,
                    background:
                      'linear-gradient(45deg, #f5a623 30%, #f8e71c 90%)',
                    color: '#000',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 20px rgba(245, 166, 35, 0.5)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 25px rgba(245, 166, 35, 0.6)',
                    },
                  }}
                >
                  CONTACTAR AHORA
                </Button>
              </Box>
            </Paper>
          </Fade>
        </Container>

        {/* Footer */}
        <Footer />
      </Box>
    </ThemeProvider>
  );
};
