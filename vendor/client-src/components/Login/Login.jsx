import { useState } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
  ThemeProvider,
} from '@mui/material';

// ICONS
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
// <--------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
import { ForgotPassword } from '../ForgotPassword/ForgotPassword.jsx';
import { Register } from '../Register/Register.jsx';
// --------------------

// ---- THEME ----
import { mainAppModalTheme } from '@/theme/main-theme.js';
// ---------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- STYLES ----
const inputStyles = {
  '& .MuiInputBase-root': {
    color: 'text.primary',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: { xs: '8px', sm: '12px' },
    fontSize: { xs: '14px', sm: '16px', md: '16px' },
    minHeight: { xs: '48px', sm: '56px', md: '56px' },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(184, 182, 186, 0.3)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'primary.main',
      borderWidth: '1px',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: '2px',
      boxShadow: '0 0 0 3px rgba(245, 166, 35, 0.2)',
    },
  },
  width: '100%',
  marginBottom: { xs: '16px', sm: '20px', md: '20px' },
};

const labelStyle = {
  fontFamily: 'fontFamily.secondary',
  color: 'text.primary',
  fontWeight: 'bold',
  fontSize: { xs: '14px', sm: '16px', md: '16px' },
  lineHeight: 1,
  margin: 0,
};

const labelContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 1, sm: 1.5, md: 1.5 },
  mb: { xs: 1, sm: 1.5, md: 1 },
};

const iconStyle = {
  color: 'primary.main',
  fontSize: { xs: '18px', sm: '20px', md: '22px' }, // 🔄 CAMBIO: Tamaño proporcional al texto
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const buttonStyles = {
  background: 'linear-gradient(45deg, #f5a623 30%, #f8e71c 90%)',
  color: 'text.terciary',
  fontWeight: 'bold',
  borderRadius: { xs: '8px', sm: '12px' },
  padding: { xs: '14px 20px', sm: '12px 24px', md: '18px 32px' },
  textTransform: 'none',
  fontSize: { xs: '15px', sm: '16px', md: '16px' },
  minHeight: { xs: '48px', sm: '56px', md: '64px' },
  boxShadow: '0 4px 15px rgba(245, 166, 35, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #e6951f 30%, #e6d018 90%)',
    boxShadow: '0 6px 20px rgba(245, 166, 35, 0.4)',
    transform: 'translateY(-2px)',
  },
};
// ------------------

export const Login = ({ open, onClose }) => {
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { userLogin } = useUser();

  const [openRegister, setOpenRegister] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [formLogin, setFormLogin] = useState({
    email: '',
    password: '',
  });

  const handlerInputChange = (e) => {
    setFormLogin({
      ...formLogin,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formLogin.email) return showAlert('El email es requerido');
    if (!formLogin.password) return showAlert('La contraseña es requerida');

    setLoading(true);
    try {
      await userLogin(formLogin);
      showAlert('Usuario logueado correctamente!', 'success');
      onClose();
    } catch (error) {
      const errorMessage =
        error ||
        'Error: Demasiados intentos fallidos, por favor intente dentro de 15 minutos';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingComponent message={'Iniciando Sesión...'} />;

  return (
    <ThemeProvider theme={mainAppModalTheme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={isDesktop ? 'md' : 'sm'}
        fullWidth
        fullScreen={isXsScreen}
        PaperProps={{
          sx: {
            borderRadius: {
              xs: isXsScreen ? 0 : '12px',
              sm: '16px',
              md: '20px',
            },
            overflow: 'hidden',
            bgcolor: 'background.default',
            boxShadow: 'primary.main',
            border: 'primary.main',
            maxHeight: { xs: '100vh', sm: '90vh', md: '85vh' },
            width: { xs: '100%', sm: 'auto', md: '600px' },
            margin: { xs: 0, sm: '32px' },
          },
        }}
        TransitionProps={{
          style: {
            transition: isMobile
              ? 'transform 300ms ease-in-out'
              : 'opacity 300ms ease-in-out',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            padding: { xs: 2, sm: 3, md: 4 },
            borderBottom: '2px solid #f5a623',
            position: { xs: 'sticky', sm: 'static' },
            top: 0,
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontFamily: 'fontFamily.primary',
                color: 'text.primary',
                fontSize: { xs: '18px', sm: '24px', md: '20px' },
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1, md: 1.5 },
                fontWeight: 'bold',
              }}
            >
              <LoginIcon
                sx={{
                  color: 'primary.main',
                  fontSize: { xs: '20px', sm: '24px', md: '32px' },
                }}
              />
              INICIAR SESIÓN
            </Typography>
            <IconButton
              edge="end"
              aria-label="close"
              size={isDesktop ? 'large' : 'small'}
              onClick={onClose}
              sx={{
                color: 'text.primary',
                minWidth: { xs: '44px', sm: 'auto', md: '48px' },
                minHeight: { xs: '44px', sm: 'auto', md: '48px' },
                '&:hover': {
                  backgroundColor: 'rgba(245, 166, 35, 0.1)',
                  color: 'primary.main',
                },
              }}
            >
              <CloseIcon
                sx={{ color: 'primary.main', fontSize: { md: '28px' } }}
              />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            bgcolor: 'background.default',
            p: { xs: 1.5, sm: 3, md: 4 },
            overflow: 'auto',
            maxHeight: { xs: 'calc(100vh - 120px)', sm: 'none' },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              bgcolor: 'background.paper',
              borderRadius: { xs: '8px', sm: '12px' },
              border: '1px solid rgba(184, 182, 186, 0.1)',
              mb: { xs: 2, sm: 3 },
              mt: { xs: 1, sm: 1.5 },
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ width: '100%' }}
            >
              <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                {/* EMAIL */}
                <Box sx={labelContainerStyle}>
                  <AlternateEmailIcon sx={iconStyle} />
                  <Typography sx={labelStyle}>EMAIL</Typography>
                </Box>
                <TextField
                  required
                  fullWidth
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ingrese su email"
                  autoComplete="email"
                  autoFocus={!isMobile}
                  value={formLogin.email}
                  onChange={handlerInputChange}
                  sx={{
                    ...inputStyles,
                    '& .MuiInputBase-input': {
                      padding: {
                        xs: '14px 16px',
                        sm: '16px 20px',
                        md: '20px 24px',
                      },
                    },
                  }}
                  inputProps={{
                    style: {
                      fontSize: isMobile ? '16px' : isDesktop ? '16px' : '14px',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: { xs: 1, sm: 2.5, md: 3 } }}>
                {/* CONTRASEÑA */}
                <Box sx={labelContainerStyle}>
                  <LockIcon sx={iconStyle} />
                  <Typography sx={labelStyle}>CONTRASEÑA</Typography>
                </Box>
                <FormControl fullWidth required sx={inputStyles}>
                  <OutlinedInput
                    id="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={formLogin.password}
                    onChange={handlerInputChange}
                    sx={{
                      borderRadius: { xs: '8px', sm: '12px' },
                      '& .MuiInputBase-input': {
                        padding: {
                          xs: '14px 16px',
                          sm: '16px 20px',
                          md: '20px 24px',
                        },
                      },
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword
                              ? 'ocultar contraseña'
                              : 'mostrar contraseña'
                          }
                          onClick={togglePasswordVisibility}
                          edge="end"
                          size="small"
                          sx={{
                            color: 'primary.main',
                            minWidth: { xs: '44px', sm: 'auto', md: '48px' },
                            minHeight: { xs: '44px', sm: 'auto', md: '48px' },
                            mr: { xs: 0.5, sm: 1, md: 1.5 },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    inputProps={{
                      style: {
                        fontSize: isMobile
                          ? '16px'
                          : isDesktop
                          ? '16px'
                          : '14px',
                      },
                    }}
                  />
                </FormControl>
              </Box>

              {/* Forgot Password Link */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mb: { xs: 1.5, sm: 4 },
                }}
              >
                <Button
                  fullWidth
                  onClick={() => setOpenForgotPassword(true)}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'primary.main',
                    textTransform: 'none',
                    p: { xs: 1.5, sm: 1 },
                    fontSize: { xs: '14px', sm: '16px' },
                    minHeight: { xs: '44px', sm: 'auto' },
                    '&:hover': {
                      bgcolor: 'rgba(245, 166, 35, 0.1)',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={
                  <LoginIcon sx={{ fontSize: { xs: '18px', sm: '20px' } }} />
                }
                sx={buttonStyles}
              >
                Iniciar Sesión
              </Button>
            </Box>
          </Paper>

          {/* REGISTER */}
          <Box
            sx={{
              textAlign: 'center',
              mt: { xs: 2, sm: 3 },
              pb: { xs: 2, sm: 0 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                mb: { xs: 1.5, sm: 1 },
                fontSize: { xs: '14px', sm: '16px' },
              }}
            >
              ¿No tienes una cuenta?
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenRegister(true)}
              sx={{
                fontFamily: 'fontFamily.primary',
                bgcolor: 'transparent',
                color: 'text.primary',
                borderColor: 'text.primary',
                borderWidth: '1px',
                borderRadius: { xs: '8px', sm: '12px' },
                padding: { xs: '14px 20px', sm: '12px 24px' },
                textTransform: 'none',
                fontSize: { xs: '13px', sm: '15px' },
                minHeight: { xs: '48px', sm: '56px' },
                '&:hover': {
                  backgroundColor: 'rgba(245, 166, 35, 0.1)',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
              }}
            >
              REGISTRARME
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {AlertComponent}
      <ForgotPassword
        open={openForgotPassword}
        onClose={() => setOpenForgotPassword(false)}
      />
      <Register open={openRegister} onClose={() => setOpenRegister(false)} />
    </ThemeProvider>
  );
};
