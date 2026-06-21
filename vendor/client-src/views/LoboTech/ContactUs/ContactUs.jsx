import { useState, useEffect } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Fade,
  Grow,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  ThemeProvider,
} from '@mui/material';
// ICONS
import {
  AlternateEmail,
  Send as SendIcon,
  Instagram as InstagramIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
// ---------------------

// ---- SERVICES ----
import { sendContactFormServices } from '@/services/contactForm.js';
// ------------------

// ---- THEME ----
import { lobotechAppTheme } from '@/theme/main-theme.js';
// ---------------

// ---- LOGO ----
import mainLogo from '@/assets/main/logo-white.png';
// --------------

// ---- COMPONENTS ----
import { MainNavBar } from '@/components/MainNavBar/MainNavBar.jsx';
import { LoboTechNavBar } from '@/components/LoboTechNavBar/LoboTechNavBar.jsx';
import { Footer } from '../Footer/Footer.jsx';
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- STYLES ----
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255,255,255,0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#f5a623',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'white',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#f5a623',
  },
  '& .MuiFormHelperText-root': {
    color: 'error.main',
  },
};
// ----------------

export const ContactUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const [showContent, setShowContent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  // Animación de entrada
  useEffect(() => {
    setShowContent(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.message.trim()) newErrors.message = 'El mensaje es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        // Aquí iría la lógica para enviar el formulario
        await sendContactFormServices(formData);
        // Mensaje de éxito
        showAlert(
          '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.',
          'success'
        );
        // Resetear formulario
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
      } catch (error) {
        const errorMessage = error || 'Error al enviar el email';
        showAlert(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Información de contacto
  const contactInfo = [
    {
      icon: <InstagramIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Instagram',
      content: 'lobotech.bb',
      action: () =>
        (window.location.href = 'https://www.instagram.com/lobotech.bb/'),
    },
    {
      icon: <AlternateEmail fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Email',
      content: 'lobotech.bb@gmail.com',
      action: () => (window.location.href = 'mailto:lobotech.bb@gmail.com'),
    },
    {
      icon: <LocationIcon fontSize="large" sx={{ color: '#FFF' }} />,
      title: 'Ubicación',
      content: 'Bahía Blanca, Buenos Aires, Argentina',
    },
  ];

  if (loading) return <LoadingComponent message={'Enviando mensaje...'} />;

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
        <MainNavBar theme={lobotechAppTheme} title={'LOBOTECH'} />

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
                  CONTACTO
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.secondary',
                    mb: 1,
                    maxWidth: '800px',
                    mx: 'auto',
                  }}
                >
                  Estamos listos para ayudarte a transformar tu negocio
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

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
          <Grid container spacing={4}>
            {/* Formulario de contacto */}
            <Grid item xs={12} md={7}>
              <Grow in={showContent} timeout={1200}>
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    height: 'auto',
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      color: 'white',
                      fontSize: isMobile ? '1.3rem' : '2rem',
                      mb: 3,
                      position: 'relative',
                      display: 'inline-block',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        width: '50px',
                        height: '3px',
                        backgroundColor: '#f5a623',
                      },
                    }}
                  >
                    ENVÍANOS UN MENSAJE
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      color: 'rgba(255,255,255,0.8)',
                      mb: 4,
                    }}
                  >
                    Completa el formulario y nos pondremos en contacto contigo a
                    la brevedad.
                  </Typography>

                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Nombre"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          error={!!errors.name}
                          helperText={errors.name}
                          sx={textFieldStyle}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          sx={textFieldStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Teléfono (opcional)"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          sx={textFieldStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={4}
                          label="Mensaje"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          error={!!errors.message}
                          helperText={errors.message}
                          sx={textFieldStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                          endIcon={<SendIcon />}
                          sx={{
                            fontFamily: 'fontFamily.primary',
                            py: 1.5,
                            mt: 1,
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
                          ENVIAR MENSAJE
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grow>
            </Grid>

            {/* Información de contacto */}
            <Grid item xs={12} md={5}>
              <Grow in={showContent} timeout={1500}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    height: '100%',
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: 4,
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
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
                          bottom: '-8px',
                          left: 0,
                          width: '50px',
                          height: '3px',
                          backgroundColor: '#f5a623',
                        },
                      }}
                    >
                      INFORMACIÓN
                    </Typography>

                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      {contactInfo.map((info, index) => (
                        <Card
                          key={index}
                          sx={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            cursor: info.action ? 'pointer' : 'default',
                            '&:hover': info.action
                              ? {
                                  transform: 'translateY(-3px)',
                                  background: 'rgba(255,255,255,0.1)',
                                }
                              : {},
                          }}
                          onClick={info.action}
                        >
                          <CardContent
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 2,
                              '&:last-child': { pb: 2 },
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'primary.main',
                                color: 'black',
                                borderRadius: '50%',
                                p: 1,
                                minWidth: 40,
                                minHeight: 40,
                              }}
                            >
                              {info.icon}
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontFamily: 'fontFamily.primary',
                                  color: 'white',
                                  fontWeight: 'bold',
                                }}
                              >
                                {info.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'fontFamily.secondary',
                                  color: '#f5a623',
                                }}
                              >
                                {info.content}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Paper>

                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: 4,
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexGrow: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={mainLogo}
                      alt="LOBOTECH Logo"
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: '180px',
                        objectFit: 'contain',
                        mb: 2,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        color: 'white',
                        textAlign: 'center',
                        fontStyle: 'italic',
                      }}
                    >
                      "Transformando la experiencia gastronómica con tecnología
                      de vanguardia"
                    </Typography>
                  </Paper>
                </Box>
              </Grow>
            </Grid>
          </Grid>
        </Container>

        {/* FOOTER */}
        <Footer />
      </Box>
      {AlertComponent}
    </ThemeProvider>
  );
};
