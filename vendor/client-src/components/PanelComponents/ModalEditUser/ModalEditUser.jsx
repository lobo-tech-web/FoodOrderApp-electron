import { useEffect, useState, useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ICONS
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// ---------------------

// ---- UTILS ----
import { provinciasYciudades } from '@/utils/argentinaLocations.js';
// ---------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- UTILS ----
import { initialUpdateUserState } from '@/utils/userUtils.js';
// ---------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- SERVICES ----
import { deleteUserService } from '@/services/users.js';
// ------------------

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

const deleteButtonStyle = {
  fontFamily: 'fontFamily.primary',
  bgcolor: 'error.main',
  color: 'text.primary',
};
// --------------------

export const ModalEditUser = ({ show, handleClose, isEditing, showUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [loading, setLoading] = useState(false);
  const { AlertComponent, showAlert } = useAlert();
  const { userState, userModifier } = useUser();
  const [user, setUser] = useState(initialUpdateUserState);

  const provinceOptions = Object.keys(provinciasYciudades);
  const cityOptions = useMemo(() => {
    return provinciasYciudades[user.state] || [];
  }, [user.state]);

  // Días de la semana
  const daysOfWeek = [
    'LUNES',
    'MARTES',
    'MIÉRCOLES',
    'JUEVES',
    'VIERNES',
    'SÁBADO',
    'DOMINGO',
  ];

  const handleInputChange = ({ target: { name, value, type, checked } }) => {
    setUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'state' && { city: '' }),
    }));
  };

  // Manejar cambios en los horarios
  const handleWorkingHoursChange = (day, value) => {
    setUser((prev) => ({
      ...prev,
      workingHours: {
        ...(prev.workingHours || {}),
        [day]: value,
      },
    }));
  };

  // Formatear los horarios para mostrar en los campos de texto
  const formatWorkingHoursForDisplay = (workingHours, day) => {
    if (!workingHours) return '';

    const dayHours = workingHours[day];

    // Si es un array, lo unimos con comas
    if (Array.isArray(dayHours)) {
      return dayHours.join(', ');
    }

    // Si es un string, lo devolvemos directamente
    if (typeof dayHours === 'string') {
      return dayHours;
    }

    return '';
  };

  const handleDeleteUser = async (userId) => {
    const isConfirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar este USUARIO?'
    );
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await deleteUserService(userId);
      showAlert('USUARIO eliminado correctamente', 'success');
      handleClose();
    } catch (error) {
      showAlert('Error al eliminar el USUARIO', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetUser = () => {
    handleClose();
    setUser(initialUpdateUserState);
  };

  const handleSaveChanges = async () => {
    if (
      !user.name ||
      !user.email ||
      !user.cuit ||
      !user.phone ||
      !user.address ||
      !user.city ||
      !user.state ||
      !user.postalCode ||
      !user.whatsappNumber
    )
      return showAlert(
        'Por favor completar todos los campos requeridos obligatoriamente',
        'warning'
      );

    setLoading(true);
    try {
      // Procesar los horarios antes de enviar al backend
      const processedUser = {
        ...user,
        workingHours: Object.entries(user.workingHours || {}).reduce(
          (acc, [day, value]) => {
            // Si es un string vacío, usar array vacío
            if (value === '') {
              acc[day] = [];
            }
            // Si es un string con contenido, dividir por comas y limpiar
            else if (typeof value === 'string') {
              acc[day] = value
                .split(',')
                .map((time) => time.trim())
                .filter((time) => time !== '');
            }
            // Si ya es un array u otro valor, dejarlo como está
            else {
              acc[day] = value;
            }
            return acc;
          },
          {}
        ),
      };
      await userModifier(processedUser);
      showAlert('Usuario actualizado correctamente!', 'success');
      resetUser();
    } catch (error) {
      const errorMessage = error || 'Error desconocido';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      if (isEditing && showUser) {
        setUser({
          ...initialUpdateUserState,
          ...showUser,
        });
      }
    }
  }, [show, isEditing, showUser]);

  if (loading) return <LoadingComponent message={'Guardando cambios...'} />;

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
            {isEditing ? 'EDITAR USUARIO' : 'CREAR USUARIO'}
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
              {/* CAMPOS DE SÓLO LECTURA */}
              {userState?.user?.role === 'dev' &&
                [
                  { label: 'USER ID', name: 'id', type: 'text' },
                  { label: 'N° USUARIO', name: 'userNumber', type: 'number' },
                ].map((field) => (
                  <Box key={field.name}>
                    <Box sx={labelContainerStyle}>
                      <Typography sx={labelStyle}>{field.label}</Typography>
                    </Box>
                    <TextField
                      disabled
                      fullWidth
                      name={field.name}
                      type={field.type}
                      value={user[field.name]}
                      sx={{
                        ...textFieldStyle,
                        '& .MuiInputBase-input': {
                          padding: {
                            xs: '14px 16px',
                            sm: '16px 20px',
                            md: '20px 24px',
                          },
                        },
                      }}
                    />
                  </Box>
                ))}

              {/* CAMPOS DE INFORMACIÓN DE USUARIO */}
              {[
                { label: 'EMAIL', name: 'email', type: 'text' },
                { label: 'NOMBRE', name: 'name', type: 'text' },
                { label: 'DNI/CUIT/CUIL', name: 'cuit', type: 'text' },
                { label: 'TELÉFONO', name: 'phone', type: 'text' },
                { label: 'DIRECCIÓN', name: 'address', type: 'text' },
                { label: 'WHATSAPP', name: 'whatsappNumber', type: 'text' },
                { label: 'CP', name: 'postalCode', type: 'text' },
              ].map((field) => (
                <Box key={field.name}>
                  <Box sx={labelContainerStyle}>
                    <Typography sx={labelStyle}>{field.label}</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    required
                    name={field.name}
                    type={field.type}
                    value={user[field.name]}
                    onChange={handleInputChange}
                    sx={{
                      ...textFieldStyle,
                      '& .MuiInputBase-input': {
                        padding: {
                          xs: '14px 16px',
                          sm: '16px 20px',
                          md: '20px 24px',
                        },
                      },
                    }}
                  />
                </Box>
              ))}

              <Box>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>PROVINCIA</Typography>
                </Box>
                <FormControl fullWidth required sx={textFieldStyle}>
                  <Select
                    name="state"
                    value={user.state || ''}
                    onChange={handleInputChange}
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
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      color: 'text.primary',
                    }}
                  >
                    {provinceOptions.map((provincia) => (
                      <MenuItem
                        key={provincia}
                        value={provincia}
                        sx={{
                          fontFamily: 'fontFamily.terciary',
                          color: 'text.primary',
                        }}
                      >
                        {provincia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>LOCALIDAD</Typography>
                </Box>
                <FormControl fullWidth required sx={textFieldStyle}>
                  <Select
                    name="city"
                    value={user.city || ''}
                    onChange={handleInputChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography sx={{ color: 'text.disabled' }}>
                            {user.state
                              ? 'Selecciona una localidad'
                              : 'Primero selecciona una provincia'}
                          </Typography>
                        );
                      }
                      return selected;
                    }}
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      color: 'text.primary',
                    }}
                  >
                    {cityOptions.map((ciudad) => (
                      <MenuItem
                        key={ciudad}
                        value={ciudad}
                        sx={{
                          fontFamily: 'fontFamily.terciary',
                          color: 'text.primary',
                        }}
                      >
                        {ciudad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* HORARIOS DE TRABAJO */}
              {userState?.user?.role === 'dev' && (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'fontFamily.primary',
                        color: 'text.primary',
                        borderBottom: 1,
                        borderColor: 'primary.main',
                        pb: 1,
                        flexGrow: 1,
                      }}
                    >
                      HORARIOS DE TRABAJO
                    </Typography>
                    <Tooltip
                      title="Ingresa los horarios separados por comas. Ejemplo: 12:00-15:00, 19:00-23:00. Deja vacío si está cerrado."
                      arrow
                    >
                      <IconButton size="small">
                        <HelpOutlineIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {daysOfWeek.map((day) => (
                    <Box key={day}>
                      <Box sx={labelContainerStyle}>
                        <Typography sx={labelStyle}>{day}</Typography>
                      </Box>
                      <TextField
                        fullWidth
                        placeholder="Ejemplo: 12:00-15:00, 19:00-23:00"
                        value={formatWorkingHoursForDisplay(
                          user.workingHours,
                          day
                        )}
                        onChange={(e) =>
                          handleWorkingHoursChange(day, e.target.value)
                        }
                        sx={{
                          ...textFieldStyle,
                          '& .MuiInputBase-input': {
                            padding: {
                              xs: '14px 16px',
                              sm: '16px 20px',
                              md: '20px 24px',
                            },
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {/* MODIF. ROLE DEV */}
              {userState?.user?.role === 'dev' &&
                [
                  {
                    label: 'NOMBRE DEL LOCAL',
                    name: 'businessName',
                    type: 'text',
                  },
                  {
                    label: 'LINK MERCADOPAGO',
                    name: 'mercadoPagoLink',
                    type: 'text',
                  },
                  {
                    label: 'ALIAS BANCARIO',
                    name: 'transferPaymentAlias',
                    type: 'text',
                  },
                ].map((field) => (
                  <Box key={field.name}>
                    <Box sx={labelContainerStyle}>
                      <Typography sx={labelStyle}>{field.label}</Typography>
                    </Box>
                    <TextField
                      fullWidth
                      name={field.name}
                      type={field.type}
                      value={user[field.name]}
                      onChange={handleInputChange}
                      sx={{
                        ...textFieldStyle,
                        '& .MuiInputBase-input': {
                          padding: {
                            xs: '14px 16px',
                            sm: '16px 20px',
                            md: '20px 24px',
                          },
                        },
                      }}
                    />
                  </Box>
                ))}
              {userState?.user?.role === 'dev' && (
                <Box>
                  <Box sx={labelContainerStyle}>
                    <Typography sx={labelStyle}>ROLES</Typography>
                  </Box>
                  <FormControl fullWidth sx={textFieldStyle}>
                    <Select
                      name="role"
                      value={user.role || ''}
                      onChange={handleInputChange}
                      sx={{
                        fontFamily: 'fontFamily.terciary',
                        color: 'text.primary',
                      }}
                    >
                      {['user', 'admin', 'dev'].map((role) => (
                        <MenuItem
                          key={role}
                          value={role}
                          sx={{
                            fontFamily: 'fontFamily.terciary',
                            color: 'text.primary',
                          }}
                        >
                          {role?.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(user.status)}
                        onChange={handleInputChange}
                        name="status"
                        sx={{
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    }
                    label="STATUS"
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      color: 'primary.main',
                    }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box>
            {/* BOTÓN PARA ELIMINAR USUARIO (DEV) */}
            {userState?.user?.role === 'dev' && isEditing && (
              <Button
                size="small"
                onClick={() => handleDeleteUser(user.id)}
                variant="contained"
                color="error"
                sx={deleteButtonStyle}
              >
                Eliminar
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 1,
            }}
          >
            <Button
              size="medium"
              onClick={resetUser}
              color="error"
              sx={cancelButtonStyle}
            >
              Cancelar
            </Button>
            <Button
              size="medium"
              onClick={handleSaveChanges}
              variant="contained"
              sx={submitButtonStyle}
            >
              Guardar Cambios
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {AlertComponent}
    </>
  );
};
