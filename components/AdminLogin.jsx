import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import logo from '@/assets/main/logo-lobotech-oj.png';
import { useLobotechThemeContext } from '@/context/ThemeContext.jsx';
import { useUser } from '@/context/Users.jsx';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { lobotechTheme } = useLobotechThemeContext();
  const { userState, userLogin, userLogOut } = useUser();
  const [formLogin, setFormLogin] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = userState.user || {};

    if (!user.id) return;

    if (user.role === 'admin') {
      navigate('/control-panel', { replace: true });
      return;
    }

    userLogOut();
    setMessage('Este acceso es solo para administradores.');
  }, [navigate, userLogOut, userState.user]);

  const handleInputChange = (event) => {
    setMessage('');
    setFormLogin((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formLogin.email || !formLogin.password) {
      setMessage('Completa email y contrasena para ingresar.');
      return;
    }

    setLoading(true);
    try {
      await userLogin(formLogin);
    } catch (error) {
      setMessage(
        error ||
          'No se pudo iniciar sesion. Revisa tus credenciales e intenta otra vez.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lobotechTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
          px: 2,
          py: 4,
        }}
      >
        <Container maxWidth="xs" disableGutters>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: { xs: 3, sm: 4 },
            }}
          >
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src={logo}
                  alt="LoboTech"
                  sx={{ width: 156, maxWidth: '70%', mb: 2 }}
                />
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{
                    color: 'text.primary',
                    fontFamily: 'fontFamily.primary',
                    fontWeight: 700,
                  }}
                >
                  Panel de Administracion
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontFamily: 'fontFamily.secondary',
                    mt: 0.5,
                  }}
                >
                  Inicia sesion para gestionar tu restaurante.
                </Typography>
              </Box>

              {message && <Alert severity="warning">{message}</Alert>}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'grid', gap: 2 }}
              >
                <TextField
                  fullWidth
                  required
                  autoFocus
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  autoComplete="email"
                  value={formLogin.email}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AlternateEmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  required
                  id="password"
                  name="password"
                  label="Contrasena"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formLogin.password}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword
                              ? 'Ocultar contrasena'
                              : 'Mostrar contrasena'
                          }
                          edge="end"
                          onClick={() => setShowPassword((current) => !current)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : (
                      <LoginIcon />
                    )
                  }
                  sx={{
                    minHeight: 48,
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  {loading ? 'Ingresando...' : 'Ingresar al panel'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
