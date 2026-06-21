import { useState, useEffect } from 'react';

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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- SERVICES ----
import {
  addUserPointsService,
  removeUserPointsService,
} from '@/services/userPoints.js';
// ------------------

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
  gap: 1,
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

export const ModalModifyUserPoints = ({
  show,
  handleClose,
  showAlert,
  refreshUserPoints,
  isAddingPoints,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { userState } = useUser();
  const [loading, setLoading] = useState(false);

  // ESTADO INICIAL
  const initialState = {
    userNumber: '',
    restaurantId: '',
    restaurantName: '',
    points: '',
  };
  const [dataPoints, setDataPoints] = useState(initialState);

  const handleInputChange = ({ target: { name, value } }) => {
    setDataPoints((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetState = () => {
    handleClose();
    setDataPoints(initialState);
  };

  const handleSubmit = async () => {
    if (
      !dataPoints.userNumber ||
      !dataPoints.restaurantId ||
      !dataPoints.restaurantName
    )
      return showAlert('Faltan campos a completar', 'error');
    if (!dataPoints.points || dataPoints.points === '')
      return showAlert(
        'Por favor complete el campo *PUNTOS A MODIFICAR*',
        'error'
      );

    setLoading(true);
    try {
      if (isAddingPoints) {
        const payload = {
          ...dataPoints,
          points: Number(dataPoints.points) || 0,
        };
        await addUserPointsService(payload);
        showAlert(
          `Se agregaron "${dataPoints.points}" puntos al usuario: (${dataPoints.userNumber}) del local: ${dataPoints.restaurantName}`,
          'success'
        );
      } else if (!isAddingPoints) {
        const payload = {
          ...dataPoints,
          points: Number(dataPoints.points) || 0,
        };
        await removeUserPointsService(payload);
        showAlert(
          `Se removieron ${dataPoints.points} puntos al usuario: ${dataPoints.userNumber} del local: ${dataPoints.restaurantName}`,
          'success'
        );
      }
      resetState();
    } catch (error) {
      showAlert(`Error: ${error || error.message}`, 'error');
    } finally {
      setLoading(false);
      setTimeout(async () => {
        await refreshUserPoints();
      }, 1000);
    }
  };

  useEffect(() => {
    if (show && userState.user) {
      setDataPoints((prev) => ({
        ...prev,
        restaurantId: userState.user.id,
        restaurantName: userState.user.businessName,
      }));
    }
  }, [show, userState.user]);

  if (loading) return <LoadingComponent message={'Actualizando puntos...'} />;

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
            {isAddingPoints ? 'AGREGAR PUNTOS' : 'REMOVER PUNTOS'}
            {isAddingPoints ? (
              <AddCircleOutlineIcon color="success" />
            ) : (
              <RemoveCircleOutlineIcon color="error" />
            )}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
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
          <Box sx={{ width: '100%' }}>
            <Box>
              {/* N° CLIENTE */}
              <Box sx={labelContainerStyle}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography sx={labelStyle}>N° DE CLIENTE</Typography>
              </Box>
              <TextField
                required
                fullWidth
                placeholder="N° de cliente"
                name="userNumber"
                value={dataPoints.userNumber}
                onChange={handleInputChange}
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
              />
            </Box>

            {userState.user.role === 'dev' && (
              <Box>
                <Box sx={labelContainerStyle}>
                  <StoreIcon color="primary" fontSize="small" />
                  <Typography sx={labelStyle}>ID DEL LOCAL</Typography>
                </Box>
                <TextField
                  required
                  fullWidth
                  placeholder="ID del local"
                  name="restaurantId"
                  value={dataPoints.restaurantId}
                  onChange={handleInputChange}
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
                />

                <Box sx={labelContainerStyle}>
                  <StoreIcon color="primary" fontSize="small" />
                  <Typography sx={labelStyle}>NOMBRE DEL LOCAL</Typography>
                </Box>
                <TextField
                  required
                  fullWidth
                  placeholder="Nombre del local"
                  name="restaurantName"
                  value={dataPoints.restaurantName}
                  onChange={handleInputChange}
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
                />
              </Box>
            )}

            <Box>
              <Box sx={labelContainerStyle}>
                <ConfirmationNumberIcon color="primary" fontSize="small" />
                <Typography sx={labelStyle}>PUNTOS DE LOCAL</Typography>
              </Box>
              <TextField
                required
                fullWidth
                placeholder="Ej: 100"
                name="points"
                type="number"
                value={dataPoints.points}
                onChange={handleInputChange}
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
              />
            </Box>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disabled={loading}
          onClick={resetState}
          variant="contained"
          color="secondary"
          sx={cancelButtonStyle}
        >
          Cancelar
        </Button>
        <Button
          disabled={loading}
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={submitButtonStyle}
        >
          {isAddingPoints ? 'SUMAR PUNTOS' : 'REMOVER PUNTOS'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
