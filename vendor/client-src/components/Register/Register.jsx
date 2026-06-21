import { useState, useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Paper,
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  FormControl,
  OutlinedInput,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Divider,
  Tooltip,
  Collapse,
  Alert,
  LinearProgress,
  useMediaQuery,
  useTheme,
  ThemeProvider,
} from '@mui/material';
// ICONS
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import MarkunreadMailboxIcon from '@mui/icons-material/MarkunreadMailbox';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
// <--------------------

// ---- UTILS ----
import { provinciasYciudades } from '@/utils/argentinaLocations.js';
// ---------------

// ---- VALIDATE ----
import { validateRegister } from '@/utils/validate/validateRegister.js';
// ------------------

// ---- THEME ----
import { mainAppModalTheme } from '@/theme/main-theme.js';
// ---------------

// ---- SERVICES ----
import { registerUserService } from '@/services/users.js';
// ------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// Estilos comunes para inputs
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

const validationIconStyle = {
  fontSize: { xs: '16px', sm: '18px', md: '20px' },
  ml: 1,
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

// -----------

// Función para validar fortaleza de contraseña
const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: 'grey' };

  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;

  if (strength <= 25) return { strength, label: 'Débil', color: 'error' };
  if (strength <= 50) return { strength, label: 'Regular', color: 'warning' };
  if (strength <= 75) return { strength, label: 'Buena', color: 'info' };
  return { strength, label: 'Fuerte', color: 'success' };
};
// ---------

export const Register = ({ open, onClose }) => {
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    cuit: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const provinceOptions = Object.keys(provinciasYciudades);
  const cityOptions = useMemo(() => {
    return provinciasYciudades[form.state] || [];
  }, [form.state]);

  const [errors, setErrors] = useState({});
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  // 🔄 NUEVO: Calcular fortaleza de contraseña
  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // 🔄 MEJORA: Función para marcar campo como tocado
  const handleFieldBlur = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handlerInputChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...form,
      [name]: value,
      ...(name === 'state' && { city: '' }),
    };

    setForm(updatedForm);

    const validationErrors = validateRegister(updatedForm, confirmPassword);
    setErrors(validationErrors);
  };

  // Función para obtener icono de validación
  const getValidationIcon = (fieldName, value) => {
    if (!touchedFields[fieldName] || !value) return null;

    const hasError = errors[fieldName];
    if (hasError) {
      return <ErrorIcon sx={{ ...validationIconStyle, color: 'error.main' }} />;
    }

    // Solo mostrar check si el campo tiene valor y no tiene errores
    if (value && !hasError) {
      return (
        <CheckCircleIcon
          sx={{ ...validationIconStyle, color: 'success.main' }}
        />
      );
    }

    return null;
  };

  // FUNCIÓN QUE DESHABILITA EL BOTON SI NO SE COMPLETAN LOS CAMPOS REQUERIDOS EN EL REGISTER
  const isFormValid = useMemo(() => {
    const hasAllFields =
      form.email &&
      form.name.trim() &&
      form.password.trim() &&
      form.cuit.trim() &&
      form.phone.trim() &&
      form.address.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.postalCode.trim() &&
      confirmPassword.trim();

    const hasNoErrors = Object.keys(errors).length === 0;

    return hasAllFields && hasNoErrors;
  }, [form, confirmPassword, errors]);

  // 🔄 NUEVO: Calcular progreso del formulario
  const formProgress = useMemo(() => {
    const totalFields = 10; // Total de campos requeridos
    const filledFields =
      Object.values(form).filter((value) => value.trim()).length +
      (confirmPassword.trim() ? 1 : 0);
    return Math.round((filledFields / totalFields) * 100);
  }, [form, confirmPassword]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // VALIDACIÓN FINAL ANTES DE ENVIAR
    const validationErrors = validateRegister(form, confirmPassword);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      showAlert('Por favor, corrige los errores en el formulario', 'error');
      return;
    }

    setLoading(true);

    try {
      await registerUserService(form);
      showAlert('Usuario registrado correctamente!', 'success');
      onClose();
    } catch (error) {
      const errorMessage = error?.message || 'Error desconocido';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingComponent message={'Registrando Usuario...'} />;

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
              <PersonOutlineIcon
                sx={{
                  color: 'primary.main',
                  fontSize: { xs: '20px', sm: '24px', md: '32px' },
                }}
              />
              REGISTRARSE
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

          {/* Barra de progreso del formulario */}
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'fontFamily.terciary',
                  color: 'text.primary',
                }}
              >
                Progreso del formulario
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                {formProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={formProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(184, 182, 186, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'primary.main',
                  borderRadius: 3,
                },
              }}
            />
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
            sx={{
              width: '100%',
            }}
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
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'fontFamily.terciary',
                  color: 'primary.main',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PersonOutlineIcon sx={{ color: 'primary.main' }} />
                DATOS DEL USUARIO
              </Typography>

              <Divider sx={{ bgcolor: 'primary.main', mb: 3 }} />

              <Stack spacing={1}>
                {/* NOMBRE COMPLETO */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <PersonOutlineIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>NOMBRE COMPLETO</Typography>
                    {getValidationIcon('name', form.name)}
                  </Box>
                  <TextField
                    fullWidth
                    required
                    placeholder="Nombre completo"
                    name="name"
                    value={form.name}
                    onChange={handlerInputChange}
                    sx={inputStyles}
                    onBlur={() => handleFieldBlur('name')}
                    error={Boolean(errors.name && touchedFields.name)}
                    helperText={touchedFields.name ? errors.name : ''}
                  />
                </Box>

                {/* EMAIL */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <AlternateEmailIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>EMAIL</Typography>
                    {getValidationIcon('email', form.email)}
                  </Box>
                  <TextField
                    fullWidth
                    required
                    placeholder="Ingrese su email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handlerInputChange}
                    sx={inputStyles}
                    onBlur={() => handleFieldBlur('email')}
                    error={Boolean(errors.email && touchedFields.email)}
                    helperText={touchedFields.email ? errors.email : ''}
                  />
                </Box>

                {/* CONTRASEÑA */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <LockIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>CONTRASEÑA</Typography>
                    {getValidationIcon('password', form.password)}
                  </Box>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    required
                    sx={inputStyles}
                    error={Boolean(errors.password && touchedFields.password)}
                  >
                    <OutlinedInput
                      placeholder="Ingrese una contraseña"
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handlerInputChange}
                      onBlur={() => handleFieldBlur('password')}
                      endAdornment={
                        <InputAdornment position="end">
                          <Tooltip
                            title={
                              showPassword
                                ? 'Ocultar contraseña'
                                : 'Mostrar contraseña'
                            }
                          >
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      }
                    />
                    {/* Indicador de fortaleza de contraseña */}
                    {form.password && (
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            Fortaleza de contraseña
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: `${passwordStrength.color}.main`,
                              fontWeight: 'bold',
                            }}
                          >
                            {passwordStrength.label}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength.strength}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(184, 182, 186, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: `${passwordStrength.color}.main`,
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                    )}
                    {touchedFields.password && errors.password && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.password}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* REPETIR CONTRASEÑA */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <LockIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>REPETIR CONTRASEÑA</Typography>
                    {getValidationIcon('confirmPassword', confirmPassword)}
                  </Box>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    required
                    sx={inputStyles}
                    error={Boolean(
                      errors.confirmPassword && touchedFields.confirmPassword
                    )}
                  >
                    <OutlinedInput
                      placeholder="Repetir Contraseña"
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        const value = e.target.value;
                        setConfirmPassword(value);
                        const validationErrors = validateRegister(form, value);
                        setErrors(validationErrors);
                      }}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      endAdornment={
                        <InputAdornment position="end">
                          <Tooltip
                            title={
                              showConfirmPassword
                                ? 'Ocultar contraseña'
                                : 'Mostrar contraseña'
                            }
                          >
                            <IconButton
                              onClick={toggleConfirmPasswordVisibility}
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      }
                    />
                    {touchedFields.confirmPassword &&
                      errors.confirmPassword && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {errors.confirmPassword}
                        </Typography>
                      )}
                  </FormControl>
                </Box>
              </Stack>

              <Stack spacing={1}>
                {/* CUIT / CUIL / DNI */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <BadgeIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>DNI/CUIT/CUIL</Typography>
                    {getValidationIcon('cuit', form.cuit)}
                  </Box>
                  <TextField
                    fullWidth
                    required
                    placeholder="DNI/CUIT/CUIL"
                    name="cuit"
                    type="text"
                    value={form.cuit}
                    onChange={handlerInputChange}
                    onBlur={() => handleFieldBlur('cuit')}
                    sx={inputStyles}
                    error={Boolean(errors.cuit && touchedFields.cuit)}
                    helperText={touchedFields.cuit ? errors.cuit : ''}
                  />
                </Box>

                {/* TELÉFONO */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <PhoneIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>TELÉFONO</Typography>
                    {getValidationIcon('phone', form.phone)}
                  </Box>
                  <TextField
                    fullWidth
                    required
                    placeholder="Teléfono"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handlerInputChange}
                    onBlur={() => handleFieldBlur('phone')}
                    sx={inputStyles}
                    error={Boolean(errors.phone && touchedFields.phone)}
                    helperText={touchedFields.phone ? errors.phone : ''}
                  />
                </Box>

                {/* DIRECCIÓN */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <HomeIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>DIRECCIÓN</Typography>
                    {getValidationIcon('address', form.address)}
                  </Box>
                  <TextField
                    fullWidth
                    required
                    placeholder="Dirección (calle, número, dto, piso, etc.)"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handlerInputChange}
                    onBlur={() => handleFieldBlur('address')}
                    sx={inputStyles}
                    error={Boolean(errors.address && touchedFields.address)}
                    helperText={touchedFields.address ? errors.address : ''}
                  />
                </Box>

                {/* PROVINCIA */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <LocationOnIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>PROVINCIA</Typography>
                    {getValidationIcon('state', form.state)}
                  </Box>
                  <FormControl
                    fullWidth
                    required
                    sx={inputStyles}
                    error={Boolean(errors.state && touchedFields.state)}
                  >
                    <Select
                      name="state"
                      value={form.state}
                      onChange={handlerInputChange}
                      onBlur={() => handleFieldBlur('state')}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Typography sx={{ color: 'text.disabled' }}>
                              Selecciona una provincia
                            </Typography>
                          );
                        }
                        return selected;
                      }}
                    >
                      {provinceOptions.map((provincia) => (
                        <MenuItem
                          key={provincia}
                          value={provincia}
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'primary.main',
                          }}
                        >
                          {provincia}
                        </MenuItem>
                      ))}
                    </Select>
                    {touchedFields.state && errors.state && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.state}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* CIUDAD / LOCALIDAD */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <LocationOnIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>LOCALIDAD</Typography>
                    {getValidationIcon('city', form.city)}
                  </Box>
                  <FormControl
                    fullWidth
                    required
                    sx={inputStyles}
                    error={Boolean(errors.city && touchedFields.city)}
                    disabled={!form.state}
                  >
                    <Select
                      name="city"
                      value={form.city}
                      onChange={handlerInputChange}
                      onBlur={() => handleFieldBlur('city')}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Typography
                              sx={{
                                color: form.state
                                  ? 'text.disabled'
                                  : 'text.disabled',
                              }}
                            >
                              {form.state
                                ? 'Selecciona una localidad'
                                : 'Primero selecciona una provincia'}
                            </Typography>
                          );
                        }
                        return selected;
                      }}
                    >
                      {cityOptions.map((ciudad) => (
                        <MenuItem
                          key={ciudad}
                          value={ciudad}
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'primary.main',
                          }}
                        >
                          {ciudad}
                        </MenuItem>
                      ))}
                    </Select>
                    {touchedFields.city && errors.city && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.city}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* CODIGO POSTAL */}
                <Box>
                  <Box sx={labelContainerStyle}>
                    <MarkunreadMailboxIcon sx={iconStyle} />
                    <Typography sx={labelStyle}>CODIGO POSTAL</Typography>
                    {getValidationIcon('postalCode', form.postalCode)}
                  </Box>
                  <TextField
                    fullWidth
                    required
                    placeholder="Código postal"
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handlerInputChange}
                    onBlur={() => handleFieldBlur('postalCode')}
                    sx={inputStyles}
                    error={Boolean(
                      errors.postalCode && touchedFields.postalCode
                    )}
                    helperText={
                      touchedFields.postalCode ? errors.postalCode : ''
                    }
                  />
                </Box>
              </Stack>
            </Paper>

            <Collapse
              in={
                Object.keys(errors).length > 0 &&
                Object.keys(touchedFields).length > 0
              }
            >
              <Alert
                severity="warning"
                sx={{
                  mb: 2,
                  borderRadius: { xs: '8px', sm: '12px' },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    fontWeight: 'bold',
                    mb: 1,
                  }}
                >
                  Por favor, corrige los siguientes errores:
                </Typography>
                <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                  {Object.entries(errors).map(
                    ([field, error]) =>
                      touchedFields[field] && (
                        <Typography
                          component="li"
                          variant="caption"
                          key={field}
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.primary',
                            fontWeight: 'bold',
                          }}
                        >
                          {error}
                        </Typography>
                      )
                  )}
                </Box>
              </Alert>
            </Collapse>

            <Box
              sx={{
                mt: 2,
                p: 3,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!isFormValid}
                sx={buttonStyles}
              >
                Registrarse
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {AlertComponent}
    </ThemeProvider>
  );
};
