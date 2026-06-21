import React from 'react';

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
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
// ICONS
import {
  AttachMoney as AttachMoneyIcon,
  QrCode as QrCodeIcon,
  PhoneIphone as PhoneIphoneIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  SupportAgent as SupportAgentIcon,
  CloudSync as CloudSyncIcon,
  Analytics as AnalyticsIcon,
  NotificationsActive as NotificationsActiveIcon,
  ArrowForward as ArrowForwardIcon,
  MoneyOff as MoneyOffIcon,
  AllInclusive as AllInclusiveIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
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

export const PlansPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  const plans = [
    {
      id: 'planbase',
      name: 'PLAN BASE',
      subtitle: 'Pequeños locales o iniciantes',
      price: '$20.000',
      priceDescription:
        'Ideal si recién estas empezando o tenes un local pequeño',
      billingCycle: '( Facturación mensual )',
      icon: <PaymentIcon fontSize="large" sx={{ color: '#FFF' }} />,
      gradient: 'linear-gradient(45deg, #b8b6ba 30%, #212529 90%)',
      features: [
        'Registra hasta 300 pedidos mensuales',
        'Carta Digital QR',
        'Pedidos desde cualquier lugar',
        'Sistema de puntos y fidelización',
        'Panel de control administrativo',
        'Notificaciones automáticas',
        'Soporte técnico 24/7',
        'Reportes y estadísticas',
        'Integración con WhatsApp',
        'Sin límite de productos',
        'Actualizaciones automáticas',
      ],
      highlight: 'Límite de hasta 300 pedidos mensuales',
    },
    {
      id: 'planstandard',
      name: 'PLAN STANDARD',
      subtitle: 'Locales con base de venta media',
      price: '$40.000',
      priceDescription: 'Ideal si posees un local con una venta media',
      billingCycle: '( Facturación mensual )',
      icon: <PaymentIcon fontSize="large" sx={{ color: '#FFF' }} />,
      gradient: 'linear-gradient(45deg, #f5a623 30%, #f8e71c 90%)',
      features: [
        'Registra hasta 600 pedidos mensuales',
        'Carta Digital QR personalizada',
        'Pedidos desde cualquier lugar',
        'Sistema de puntos y fidelización',
        'Panel de control administrativo',
        'Notificaciones automáticas',
        'Soporte técnico 24/7',
        'Reportes y estadísticas',
        'Integración con WhatsApp',
        'Sin límite de productos',
        'Actualizaciones automáticas',
      ],
      highlight: 'Límite de hasta 600 pedidos mensuales',
    },
    {
      id: 'lobotech',
      name: 'PLAN LOBO-TECH',
      subtitle: 'Pedidos ilimitados',
      price: '$',
      priceDescription: 'Consultar por precio',
      billingCycle: '',
      icon: <AllInclusiveIcon fontSize="large" sx={{ color: '#FFF' }} />,
      gradient: 'linear-gradient(45deg, #28a745 30%, #20c997 90%)',
      features: [
        'Acceso ilimitado sin restricciones',
        'Menú completamente personalizable',
        'Sistema de puntos avanzado',
        'Panel de control premium',
        'Analytics y reportes avanzados',
        'Soporte prioritario 24/7',
        'Capacitación personalizada',
      ],
      highlight: 'Sin límites, todo incluido',
    },
  ];

  // Características principales con iconos
  const features = [
    {
      icon: <QrCodeIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Carta Digital QR',
      description:
        'Tu menú disponible 24/7 con código QR para mesas, redes sociales y cualquier plataforma digital. Actualización instantánea.',
    },
    {
      icon: <PhoneIphoneIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Pedidos desde Cualquier Lugar',
      description:
        'Tus clientes pueden ordenar desde su mesa, casa o cualquier ubicación. Experiencia optimizada sin errores de comunicación.',
    },
    {
      icon: <StarIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Sistema de Puntos',
      description:
        'Programa de fidelización automático. Tus clientes acumulan puntos con cada compra y los canjean por productos.',
    },
    {
      icon: <SpeedIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Gestión Optimizada',
      description:
        'Pedidos sin errores, notificaciones automáticas y gestión eficiente que reduce tiempos de espera y mejora la experiencia.',
    },
  ];

  // Beneficios adicionales
  const additionalBenefits = [
    {
      icon: <AnalyticsIcon />,
      title: 'Reportes y Analytics',
      description:
        'Estadísticas detalladas de ventas, productos más vendidos y comportamiento de clientes',
    },
    {
      icon: <NotificationsActiveIcon />,
      title: 'Notificaciones Automáticas',
      description:
        'Email automático al cliente sobre el estado de su pedido en tiempo real',
    },
    {
      icon: <CloudSyncIcon />,
      title: 'Sincronización en la Nube',
      description:
        'Todos tus datos seguros y sincronizados en tiempo real desde cualquier dispositivo',
    },
    {
      icon: <SupportAgentIcon />,
      title: 'Soporte 24/7',
      description:
        'Asistencia técnica completa y capacitación para tu equipo sin costo adicional',
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Aumento de Ventas',
      description:
        'Incremento promedio del 25-40% en ventas gracias a la facilidad de pedidos',
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
        <MainNavBar title={'LOBOTECH PRICING PLAN'} />

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
                  ELEGI TU PLAN
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'primary.main',
                    mb: 2,
                    maxWidth: '800px',
                    mx: 'auto',
                  }}
                >
                  Opciones flexibles para hacer crecer tu negocio
                </Typography>

                <Box>
                  <Chip
                    icon={<MoneyOffIcon />}
                    label="SIN COSTO INICIAL $0"
                    sx={{
                      fontFamily: 'fontFamily.primary',
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      mt: 3,
                      py: 3,
                      px: 3,
                      background:
                        'linear-gradient(45deg, #28a745 30%, #20c997 90%)',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                    }}
                  />
                </Box>
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
          <LoboTechNavBar theme={lobotechAppTheme} />
        </Box>

        {/* Pricing Model Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
          <Grid container spacing={4} alignItems="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={6} key={plan.id}>
                <Grow in={showContent} timeout={1500 + index * 500}>
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
                      border: '2px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        border: '2px solid rgba(245,166,35,0.5)',
                      },
                    }}
                  >
                    {/* Plan Header */}
                    <Box
                      sx={{
                        background: plan.gradient,
                        p: 3,
                        textAlign: 'center',
                        position: 'relative',
                      }}
                    >
                      <Box sx={{ mb: 2 }}>{plan.icon}</Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: 'fontFamily.terciary',
                          color: '#000',
                          fontWeight: 'bold',
                          mb: 1,
                        }}
                      >
                        {plan.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          color: '#000',
                          mb: 2,
                        }}
                      >
                        {plan.subtitle}
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{
                          fontFamily: 'fontFamily.primary',
                          color: '#000',
                          fontWeight: 'bold',
                          mb: 2,
                        }}
                      >
                        {plan.price}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          color: '#000',
                          mb: 2,
                        }}
                      >
                        {plan.priceDescription}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          color: '#000',
                          mb: 2,
                        }}
                      >
                        {plan.billingCycle}
                      </Typography>
                    </Box>

                    {/* Plan Features */}
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <List sx={{ p: 0 }}>
                        {plan.features.map((feature, featureIndex) => (
                          <ListItem
                            key={featureIndex}
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              mb: 1,
                              bgcolor: 'rgba(255,255,255,0.05)',
                              transition: 'all 0.3s',
                              '&:hover': {
                                bgcolor: '#f5a623',
                                color: '#000',
                                transform: 'translateX(5px)',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 35 }}>
                              <CheckCircleIcon
                                sx={{ color: '#28a745', fontSize: 20 }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{
                                fontFamily: 'fontFamily.secondary',
                                color: 'white',
                                fontSize: '0.95rem',
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>

                    {/* Plan Highlight */}
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          color: '#f5a623',
                          fontWeight: 'bold',
                        }}
                      >
                        {plan.highlight}
                      </Typography>
                    </Box>

                    {/* Plan Call to Action */}
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'rgba(255,255,255,0.05)',
                      }}
                    >
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
                          background: plan.gradient,
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
                        EMPEZAR AHORA
                      </Button>
                    </Box>
                  </Card>
                </Grow>
              </Grid>
            ))}
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
              BENEFICIOS PRINCIPALES
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

        {/* Additional Benefits Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
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
            BENEFICIOS ADICIONALES
          </Typography>

          <Grid container spacing={3}>
            {additionalBenefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Grow in={showContent} timeout={1500 + index * 200}>
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
                          flexWrap: 'wrap',
                          gap: 2,
                        }}
                      >
                        {React.cloneElement(benefit.icon, {
                          sx: { color: '#f5a623' },
                        })}
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'fontFamily.primary',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        >
                          {benefit.title}
                        </Typography>
                      </Box>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          color: 'rgba(255,255,255,0.8)',
                          lineHeight: 1.6,
                        }}
                      >
                        {benefit.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>

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
                  ¿LISTO PARA COMENZAR SIN RIESGOS?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'rgba(255,255,255,0.8)',
                    mb: 3,
                    maxWidth: '700px',
                    mx: 'auto',
                  }}
                >
                  Únete a cientos de negocios que ya están aumentando sus ventas
                  sin inversión inicial.
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Chip
                    icon={<AttachMoneyIcon />}
                    label="INVERSIÓN INICIAL: $0"
                    color="primary"
                    sx={{
                      fontFamily: 'fontFamily.primary',
                      fontSize: '1.1rem',
                      py: 2,
                      px: 3,
                      background:
                        'linear-gradient(45deg, #28a745 30%, #20c997 90%)',
                      fontWeight: 'bold',
                      mr: 2,
                      mb: { xs: 2, sm: 0 },
                    }}
                  />
                </Box>

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
                  EMPEZAR AHORA
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
