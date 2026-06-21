import { useState, useEffect, useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ICONS
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// ---------------------

// ---- SERVICES ----
import { updateUserPasswordService } from '@/services/users.js';
// ------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- VALIDATE ----
import { changePasswordValidate } from '@/utils/validate/validateChangePassword.js';
// ------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- STYLES ----
const textFieldStyle = {
  '& .MuiInputBase-root': {
    fontFamily: 'fontFamily.primary',
    fontSize: { xs: '14px', sm: '16px', md: '16px' },
    minHeight: { xs: '48px', sm: '56px', md: '56px' },
    color: 'text.primary',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: { xs: '8px', sm: '12px' },
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
  fontFamily: 'fontFamily.primary',
  color: 'primary.main',
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

const cancelButtonStyle = {
  fontFamily: 'fontFamily.primary',
  bgcolor: 'primary.dark',
  color: 'text.primary',
};

const submitButtonStyle = {
  fontFamily: 'fontFamily.primary',
  bgcolor: 'primary.main',
  color: 'text.terciary',
};
// ----------------

export const ChangePassword = ({ show, handleClose, showUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  // CONTEXT
  const { userLogOut } = useUser();

  const [user, setUser] = useState({
    email: '',
    password: '',
    newPassword: '',
  });
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [error, setError] = useState({});

  // FUNCIÓN QUE DESHABILITA EL BOTON SI NO SE COMPLETAN LOS CAMPOS REQUERIDOS EN EL REGISTER
  const isFormValid = useMemo(() => {
    return (
      user.email &&
      user.password.trim() &&
      user.newPassword.trim() &&
      confirmNewPassword.trim() &&
      Object.keys(error).length === 0
    );
  }, [user, confirmNewPassword, error]);

  const handlerInputChange = (e) => {
    const { name, value } = e.target;

    setUser({
      ...user,
      [name]: value,
    });

    // Validar después de actualizar el estado
    setTimeout(() => {
      const validationErrors = changePasswordValidate(confirmNewPassword, {
        ...user,
        [name]: value,
      });
      setError(validationErrors);
    }, 0);
  };

  const handlerConfirmNewPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmNewPassword(value);

    // Validar después de actualizar el estado
    setTimeout(() => {
      const validationErrors = changePasswordValidate(value, user);
      setError(validationErrors);
    }, 0);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDACIÓN FINAL ANTES DE ENVIAR
    const validationErrors = changePasswordValidate(confirmNewPassword, user);
    setError(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await updateUserPasswordService(user);
      showAlert(
        '¡Contraseña cambiada correctamente! Vuelva a iniciar sesión por favor',
        'success'
      );
      handleClose();
      setTimeout(() => {
        userLogOut();
      }, 2000);
    } catch (error) {
      const errorMessage = error.message || 'Error al cambiar la contraseña';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && showUser) {
      setUser((prev) => ({
        ...prev,
        email: showUser.email,
      }));
    }
  }, [show, showUser]);

  if (loading) return <LoadingComponent />;

  return (
    <>
      <Dialog
        open={show}
        onClose={handleClose}
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
            padding: { xs: 2, sm: 3, md: 3 },
            borderBottom: '2px solid #f5a623',
            position: { xs: 'sticky', sm: 'static' },
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'primary.main',
              fontSize: { xs: '18px', sm: '24px', md: '20px' },
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              fontWeight: 'bold',
            }}
          >
            CAMBIAR CONTRASEÑA
          </Typography>
        </DialogTitle>

        <DialogContent>
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
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <Box>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>CONTRASEÑA ACTUAL</Typography>
                </Box>
                <FormControl
                  fullWidth
                  required
                  sx={textFieldStyle}
                  error={!!error.password}
                >
                  <OutlinedInput
                    fullWidth
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={user.password}
                    onChange={handlerInputChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          color="primary"
                          edge="end"
                          aria-label={
                            showPassword
                              ? 'Ocultar contraseña actual'
                              : 'Mostrar contraseña actual'
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Contraseña"
                  />
                  {error.password && (
                    <FormHelperText
                      error
                      sx={{ fontFamily: 'fontFamily.secondary' }}
                    >
                      {error.password}
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>

              <Box>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>NUEVA CONTRASEÑA</Typography>
                </Box>
                <FormControl
                  fullWidth
                  required
                  sx={textFieldStyle}
                  error={!!error.newPassword}
                >
                  <OutlinedInput
                    fullWidth
                    id="new-password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={user.newPassword}
                    onChange={handlerInputChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          color="primary"
                          edge="end"
                          aria-label={
                            showNewPassword
                              ? 'Ocultar nueva contraseña'
                              : 'Mostrar nueva contraseña'
                          }
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Nueva Contraseña"
                  />
                  {error.newPassword && (
                    <FormHelperText
                      error
                      sx={{ fontFamily: 'fontFamily.secondary' }}
                    >
                      {error.newPassword}
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>

              <Box>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>
                    CONFIRMAR NUEVA CONTRASEÑA
                  </Typography>
                </Box>
                <FormControl
                  fullWidth
                  required
                  sx={textFieldStyle}
                  error={!!error.confirmNewPassword}
                >
                  <OutlinedInput
                    fullWidth
                    id="confirm-new-password"
                    name="confirmNewPassword"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={handlerConfirmNewPasswordChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmNewPassword(!showConfirmNewPassword)
                          }
                          color="primary"
                          edge="end"
                          aria-label={
                            showConfirmNewPassword
                              ? 'Ocultar confirmación de contraseña'
                              : 'Mostrar confirmación de contraseña'
                          }
                        >
                          {showConfirmNewPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Confirmar Nueva Contraseña"
                  />
                  {error.confirmNewPassword && (
                    <FormHelperText
                      error
                      sx={{ fontFamily: 'fontFamily.primary' }}
                    >
                      {error.confirmNewPassword}
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="medium"
            onClick={handleClose}
            variant="contained"
            color="error"
            sx={cancelButtonStyle}
          >
            Cancelar
          </Button>
          <Button
            size="medium"
            disabled={!isFormValid}
            onClick={handleSubmit}
            variant="contained"
            sx={submitButtonStyle}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
      {AlertComponent}
    </>
  );
};
