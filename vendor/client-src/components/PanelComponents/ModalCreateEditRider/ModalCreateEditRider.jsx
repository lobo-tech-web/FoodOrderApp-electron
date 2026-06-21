import { useState, useEffect, useCallback } from 'react';

// ---- MATERIAL UI ----
import {
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
import { useOrders } from '@/context/Orders.jsx';
// -----------------

// ---- STYLES ----
const inputStyles = {
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
// --------------

export const ModalCreateEditRider = ({
  show,
  handleClose,
  showAlert,
  showRider,
  isEditing,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [loading, setLoading] = useState(false);
  const [riderData, setRiderData] = useState({
    restaurantId: '',
    name: '',
    phone: '',
    isActive: true,
  });

  const { userState } = useUser();
  const { addNewRider, updateRider } = useOrders();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRiderData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveChanges = useCallback(async () => {
    if (!riderData.name || !riderData.restaurantId) {
      showAlert(
        'Por favor completar todos los campos requeridos obligatoriamente',
        'warning'
      );
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateRider(riderData);
        showAlert('Cadete editado Exitosamente!', 'success');
      } else {
        await addNewRider(riderData);
        showAlert('Cadete creado Exitosamente!', 'success');
      }
      handleClose();
    } catch (error) {
      const errorMessage = error || 'Error desconocido';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [riderData, isEditing, addNewRider, updateRider, showAlert, handleClose]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSaveChanges();
    } else if (event.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (show && isEditing && showRider) {
      setRiderData(showRider);
    }
  }, [show, isEditing, showRider]);

  useEffect(() => {
    if (show && !isEditing && userState?.user?.id) {
      setRiderData({
        restaurantId: userState.user.id,
        name: '',
        phone: '',
        isActive: true,
      });
    }
  }, [show, isEditing, userState]);

  if (loading) return <LoadingComponent message={'Guardando cambios...'} />;

  return (
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
              color: 'primary.main',
              fontSize: { xs: '18px', sm: '24px', md: '20px' },
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              fontWeight: 'bold',
            }}
          >
            {isEditing ? 'EDITANDO CADETE' : 'CREAR CADETE'}
          </Typography>
        </Box>
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
          <Box
            component="form"
            onKeyDown={handleKeyPress}
            noValidate
            sx={{ width: '100%' }}
          >
            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>NOMBRE DEL CADETE</Typography>
              </Box>
              <TextField
                required
                fullWidth
                type="text"
                name="name"
                value={riderData.name}
                onChange={(e) => handleInputChange(e)}
                autoFocus
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
            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>TELÉFONO DEL CADETE</Typography>
              </Box>
              <TextField
                required
                fullWidth
                type="text"
                name="phone"
                value={riderData.phone}
                onChange={(e) => handleInputChange(e)}
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

            {/* ACTIVAR/DESACTIVAR CADETE */}
            {isEditing && showRider && (
              <Box>
                <FormControlLabel
                  label="Activar/Desactivar"
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    color: 'primary.main',
                  }}
                  control={
                    <Checkbox
                      name="isActive"
                      checked={riderData.isActive}
                      onChange={(e) => handleInputChange(e)}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                />
              </Box>
            )}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            size="medium"
            onClick={handleClose}
            variant="contained"
            sx={cancelButtonStyle}
          >
            Cancelar
          </Button>
          <Button
            size="medium"
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            sx={submitButtonStyle}
          >
            {isEditing ? 'GUARDAR CAMBIOS' : 'CREAR NUEVO CADETE'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
