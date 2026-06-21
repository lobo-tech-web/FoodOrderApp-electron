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
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
  ThemeProvider,
} from '@mui/material';
// ICONS
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
// <--------------------

// ---- THEME ----
import { mainAppModalTheme } from '@/theme/main-theme.js';
// ---------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- SERVICES ----
import { forgotPasswordService } from '@/services/users.js';
// ------------------

// ---- STYLES ----
const inputStyles = {
  '& .MuiInputBase-root': {
    color: 'text.primary',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: { xs: '8px', sm: '12px' },
    fontSize: { xs: '14px', sm: '16px', md: '16px' },
    minHeight: { xs: '48px', sm: '56px', md: '56px' },
    transition: 'all 0.3s ease',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(184, 182, 186, 0.3)',
      borderWidth: '1px',
      transition: 'all 0.3s ease',
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
    '&.Mui-error fieldset': {
      borderColor: 'error.main',
      borderWidth: '1px',
    },
    '&.Mui-error:hover fieldset': {
      borderColor: 'error.main',
      borderWidth: '2px',
    },
  },
  width: '100%',
  marginBottom: { xs: '8px', sm: '12px', md: '12px' },
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
  mb: { xs: 0.8, sm: 1, md: 1 },
};

const iconStyle = {
  color: 'primary.main',
  fontSize: { xs: '18px', sm: '20px', md: '22px' },
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
  '&:disabled': {
    background: 'rgba(184, 182, 186, 0.3)',
    color: 'rgba(255, 255, 255, 0.5)',
    boxShadow: 'none',
    transform: 'none',
  },
};
// ------------------

export const ForgotPassword = ({ open, onClose }) => {
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [formForgotPass, setFormForgotPass] = useState({
    email: '',
    cuit: '',
  });

  const handlerInputChange = (e) => {
    setFormForgotPass({
      ...formForgotPass,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formForgotPass.email)
      return showAlert('El email es requerido', 'error');
    if (!formForgotPass.cuit)
      return showAlert('El CUIT/CUIL/DNI es requerido', 'error');

    setLoading(true);
    try {
      const response = await forgotPasswordService(formForgotPass);
      if (response.error)
        showAlert(response.message || 'Error desconocido', 'error');
      else
        showAlert(
          response.message ||
            'Se ha enviado un correo con su nueva contraseña temporal',
          'success'
        );
      onClose();
    } catch (error) {
      const errorMessage = error || error?.message;
      showAlert(
        errorMessage ||
          'Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

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
            maxHeight: { xs: '100vh', sm: '95vh', md: '90vh' },
            width: { xs: '100%', sm: 'auto', md: '700px' },
            margin: { xs: 0, sm: '16px' },
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
        {loading && <LoadingComponent message={'Procesando...'} />}
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
              <LockIcon
                sx={{
                  color: 'primary.main',
                  fontSize: { xs: '20px', sm: '24px', md: '32px' },
                }}
              />
              RECUPERAR CONTRASEÑA
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
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ width: '100%' }}
          >
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: { xs: '8px', sm: '12px' },
                border: '1px solid rgba(184, 182, 186, 0.1)',
                borderColor: 'divider',
                mb: { xs: 2, sm: 3 },
                mt: { xs: 1, sm: 1.5 },
                p: { xs: 2, sm: 3, md: 4 },
              }}
            >
              {/* EMAIL */}
              <Box>
                <Box sx={labelContainerStyle}>
                  <AlternateEmailIcon sx={iconStyle} />
                  <Typography sx={labelStyle}>EMAIL</Typography>
                </Box>
                <TextField
                  required
                  fullWidth
                  placeholder="Ingrese su email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={formForgotPass.email}
                  onChange={handlerInputChange}
                  sx={inputStyles}
                />
              </Box>

              {/* CUIT/CUIL/DNI */}
              <Box>
                <Box sx={labelContainerStyle}>
                  <PersonOutlineIcon sx={iconStyle} />
                  <Typography sx={labelStyle}>CUIT/CUIL/DNI</Typography>
                </Box>
                <TextField
                  required
                  fullWidth
                  placeholder="Ingrese su CUIT/CUIL/DNI"
                  id="cuit"
                  name="cuit"
                  value={formForgotPass.cuit}
                  onChange={handlerInputChange}
                  sx={inputStyles}
                />
              </Box>

              {/* INFORMACIÓN DETALLADA */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  mt: 1,
                  mb: 3,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                  }}
                >
                  Con cualquier problema al restaurar la contraseña te puedes
                  comunicar al siguiente email:{' '}
                  <strong>lobotech.bb@gmail.com</strong>
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={buttonStyles}
              >
                Enviar
              </Button>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>
      {AlertComponent}
    </ThemeProvider>
  );
};
