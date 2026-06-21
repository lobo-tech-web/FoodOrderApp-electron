import { useState, useEffect, useCallback, useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
// ICONS
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Pending as PendingIcon,
  FactCheck as FactCheckIcon,
  DeliveryDining as DeliveryDiningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Moped as MopedIcon,
} from '@mui/icons-material';
// ---------------------

// ---- CONTEXT ----
import { useOrders } from '@/context/Orders.jsx';
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- SERVICES ----
import { updateArrayOrderServices } from '@/services/orders.js';
// ------------------

// ---- STYLES ----
const fieldStyles = {
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
// ----------------

export const ModalEditArrayOrders = ({
  show,
  handleClose,
  showAlert,
  showOrders = [],
  refreshOrders,
}) => {
  const [loading, setLoading] = useState(false);
  const [extraPoints, setExtraPoints] = useState(0);
  const [status, setStatus] = useState('');
  const [rider, setRider] = useState(undefined);

  const { orderState, getRidersByRestaurant } = useOrders();
  const { userState } = useUser();

  const availableRiders = useMemo(
    () => orderState?.riders || [],
    [orderState?.riders]
  );

  const handlePointsChange = (e) => {
    // Solo permitir números positivos
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setExtraPoints(value);
    }
  };

  const statusDisplay = [
    {
      value: 'PENDIENTE A CONFIRMAR',
      label: 'PENDIENTE A CONFIRMAR',
      icon: <PendingIcon sx={{ color: '#ff9800' }} />,
    },
    {
      value: 'EN PREPARACIÓN',
      label: 'EN PREPARACIÓN',
      icon: <FactCheckIcon sx={{ color: '#2196f3' }} />,
    },
    {
      value: 'EN ENVIO',
      label: 'EN ENVIO',
      icon: <DeliveryDiningIcon sx={{ color: '#9c27b0' }} />,
    },
    {
      value: 'FINALIZADO',
      label: 'FINALIZADO',
      icon: <CheckCircleIcon sx={{ color: '#4caf50' }} />,
    },
    {
      value: 'CANCELADO',
      label: 'CANCELADO',
      icon: <CancelIcon sx={{ color: '#f44336' }} />,
    },
  ];

  const handleSaveChanges = useCallback(async () => {
    if (!showOrders || showOrders.length === 0)
      return showAlert(
        'No hay pedidos para actualizar, por favor seleccione los pedidos para actualizar',
        'warning'
      );
    if (!status)
      return showAlert(
        'Debe seleccionar un estado de orden para el pedido',
        'warning'
      );

    setLoading(true);
    try {
      const ordersData = {
        orderList: showOrders.map((order) => ({ id: order.id })),
        extraPoints: extraPoints || 0,
        status: status || undefined,
        ...(rider !== undefined && { riderId: rider }),
      };

      await updateArrayOrderServices(ordersData);
      showAlert('Pedido/s actualizado/s Correctamente!', 'success');
      handleClose();
    } catch (error) {
      const errorMessage =
        error ||
        error?.message ||
        error?.status?.message ||
        'Error al actualizar los pedidos';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
      setTimeout(async () => {
        await refreshOrders();
      }, 1500);
    }
  }, [status, extraPoints, rider, showOrders, showAlert, handleClose]);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        if (!show || !userState?.user?.id) return;
        setStatus('');
        setRider(undefined);
        await getRidersByRestaurant(userState.user.id);
      } catch (error) {
        console.error('Error al obtener los riders:', error);
      }
    };
    fetchRiders();
  }, [show, userState?.user?.id]);

  return (
    <Dialog
      open={show}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'fontFamily.terciary',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          color: 'primary.main',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <EditIcon color="primary" />
          <Typography
            variant="h5"
            component="span"
            sx={{ display: 'flex', justifyContent: 'flex-start' }}
          >
            EDITAR PEDIDOS
          </Typography>
          <Chip
            label={`${showOrders.length} ${
              showOrders.length === 1 ? 'PEDIDO' : 'PEDIDOS'
            }`}
            color="primary"
            size="medium"
            sx={{ ml: 1 }}
          />
        </Box>
        <Tooltip title="Cerrar">
          <IconButton onClick={handleClose}>
            <CloseIcon color="primary" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ maxHeight: '65vh', overflowY: 'auto', p: 3 }}
      >
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'fontFamily.terciary',
                textAlign: 'center',
                mb: 2,
                color: 'text.primary',
              }}
            >
              PEDIDOS SELECCIONADOS
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {/* ID DE LOS PEDIDOS */}
              {showOrders.map((order) => (
                <Chip
                  key={order.id}
                  label={`PEDIDO-ID ${order.id}`}
                  variant="outlined"
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    color: 'primary.main',
                    borderColor: 'text.primary',
                    fontSize: '1rem',
                    textAlign: 'center',
                    mt: 1,
                    mb: 1,
                  }}
                />
              ))}
            </Paper>

            <Divider sx={{ bgcolor: 'primary.main', my: 3 }} />

            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: 'fontFamily.terciary',
                mb: 2,
                color: 'text.primary',
                fontWeight: 'bold',
              }}
            >
              ACTUALIZAR INFORMACIÓN
            </Typography>

            {/* PUNTOS EXTRAS */}
            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>PUNTOS EXTRAS</Typography>
              </Box>
              <TextField
                fullWidth
                type="text"
                name="extraPoints"
                value={extraPoints || 0}
                onChange={handlePointsChange}
                sx={fieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddCircleOutlineIcon sx={{ color: 'success.main' }} />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0 },
                }}
              />
            </Box>

            {/* STATUS DEL PEDIDO */}
            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>ESTADO DEL PEDIDO</Typography>
              </Box>
              <FormControl fullWidth sx={fieldStyles}>
                <Select
                  name="status"
                  value={status || ''}
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ color: 'text.primary' }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <Typography sx={{ color: 'text.secondary' }}>
                          Estado del pedido
                        </Typography>
                      );
                    }
                    return selected;
                  }}
                >
                  <MenuItem
                    value={''}
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                    }}
                  >
                    No cambiar estado del pedido
                  </MenuItem>
                  {statusDisplay.map((status) => (
                    <MenuItem
                      key={status.value}
                      value={status.value}
                      sx={{
                        fontFamily: 'fontFamily.terciary',
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {status.icon}
                        <Typography
                          sx={{
                            fontFamily: 'fontFamily.terciary',
                            color: 'text.secondary',
                          }}
                        >
                          {status.value}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {availableRiders.length > 0 && (
              <Box>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>
                    ASIGNAR RIDER (CADETE)
                  </Typography>
                </Box>
                <FormControl fullWidth sx={fieldStyles}>
                  <Select
                    name="rider"
                    value={rider || ''}
                    onChange={(e) => setRider(e.target.value)}
                    sx={{ color: 'text.primary' }}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography sx={{ color: 'text.secondary' }}>
                            Asignar rider
                          </Typography>
                        );
                      }

                      const selectedRider = availableRiders.find(
                        (r) => r.id === selected
                      );
                      return selectedRider
                        ? `${selectedRider.name} ${selectedRider.phone ? `(${selectedRider.phone})` : ''}`
                        : 'Rider seleccionado';
                    }}
                  >
                    <MenuItem
                      value={undefined}
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                      }}
                    >
                      No cambiar rider
                    </MenuItem>
                    {availableRiders.map((rider) => (
                      <MenuItem
                        key={rider.id}
                        value={rider.id}
                        sx={{ fontFamily: 'fontFamily.terciary' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <MopedIcon color="primary" />
                          <Typography
                            variant="body1"
                            sx={{
                              fontFamily: 'fontFamily.terciary',
                            }}
                          >
                            {rider.name.toUpperCase()}{' '}
                            {rider.phone && `(${rider.phone})`}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'flex-end',
          px: 3,
          py: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Button
          size="medium"
          variant="contained"
          color="error"
          onClick={handleClose}
          disabled={loading}
          sx={{ fontFamily: 'fontFamily.primary' }}
        >
          Cancelar
        </Button>
        <Button
          size="medium"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveChanges}
          disabled={showOrders.length === 0 || loading}
          sx={{ fontFamily: 'fontFamily.primary', minWidth: 120 }}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};
