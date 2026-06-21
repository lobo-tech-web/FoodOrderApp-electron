import { useState, useEffect } from 'react';

// ---- MATERIAL UI ----
import {
  Popover,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Fade,
} from '@mui/material';
// ICONS
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
// ---------------------

// ---- SERVICES ----
import {
  addUserPointsService,
  removeUserPointsService,
} from '@/services/userPoints.js';
// ------------------

export const RestaurantUserPoints = ({
  anchorEl,
  open,
  onClose,
  showAlert,
  selectedUserPoints,
  isAddingPoints,
  refreshUserPoints,
}) => {
  const [points, setPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setPoints('');
      setSuccess(false);
    }
  }, [open]);

  const handlePointsChange = (e) => {
    // Solo permitir números positivos
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setPoints(value);
    }
  };

  const handleSubmit = async () => {
    if (!points || points === '') {
      showAlert('Por favor ingrese la cantidad de puntos', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userNumber: selectedUserPoints.user?.userNumber,
        userName: selectedUserPoints.user?.name || '',
        userEmail: selectedUserPoints.user?.email || '',
        restaurantId: selectedUserPoints.restaurantId,
        restaurantName: selectedUserPoints.restaurantName,
        points: Number(points),
      };

      if (isAddingPoints) {
        await addUserPointsService(payload);
        showAlert(
          `Se agregaron ${points} puntos a ${
            selectedUserPoints.user?.name || 'usuario'
          }`,
          'success'
        );
      } else {
        await removeUserPointsService(payload);
        showAlert(
          `Se restaron ${points} puntos a ${
            selectedUserPoints.user?.name || 'usuario'
          }`,
          'success'
        );
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        refreshUserPoints();
      }, 1000);
    } catch (error) {
      showAlert(`Error: ${error?.message || error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={!loading ? onClose : undefined}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          p: 0,
          mt: 1.5,
          width: 300,
          overflow: 'visible',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          borderRadius: 2,
        },
      }}
    >
      <Paper elevation={0} sx={{ bgcolor: 'background.paper', p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'fontFamily.primary',
              color: isAddingPoints ? 'success.main' : 'error.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {isAddingPoints ? 'AGREGAR PUNTOS' : 'RESTAR PUNTOS'}
          </Typography>
          <IconButton size="small" onClick={onClose} disabled={loading}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ mb: 1, color: 'primary.main' }}>
            {`${selectedUserPoints?.user?.name || 'Usuario'} (${
              selectedUserPoints?.user?.email || ''
            })`}
          </Typography>
        </Box>

        {success ? (
          <Fade in={success}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 2,
              }}
            >
              <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
              <Typography
                variant="body1"
                sx={{ textAlign: 'center', color: 'text.primary' }}
              >
                ¡Puntos {isAddingPoints ? 'agregados' : 'restados'}{' '}
                correctamente!
              </Typography>
            </Box>
          </Fade>
        ) : (
          <>
            <TextField
              fullWidth
              autoFocus
              label={`Puntos a ${isAddingPoints ? 'agregar' : 'restar'}`}
              variant="outlined"
              value={points}
              onChange={handlePointsChange}
              disabled={loading}
              type="text"
              placeholder="Ej: 100"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ConfirmationNumberIcon
                      color={isAddingPoints ? 'success' : 'error'}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  color: 'text.primary',
                },
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.main',
                },
              }}
            />

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}
            >
              <Button
                variant="contained"
                color="error"
                onClick={onClose}
                disabled={loading}
                startIcon={<CancelIcon />}
                sx={{ width: '48%' }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color={'success'}
                onClick={handleSubmit}
                disabled={loading || !points}
                startIcon={<CheckCircleIcon />}
                sx={{ width: '48%' }}
              >
                {loading ? 'Procesando...' : 'Confirmar'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Popover>
  );
};
