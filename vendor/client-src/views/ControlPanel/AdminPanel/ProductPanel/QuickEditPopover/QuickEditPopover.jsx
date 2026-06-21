import { useState, useEffect } from 'react';

// ---- MATERIAL UI ----
import {
  Popover,
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';
// ICONS
import {
  Save as SaveIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
} from '@mui/icons-material';
// ----------------------

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
// --------------------

const fieldConfig = {
  price: {
    label: 'Precio',
    icon: MoneyIcon,
    color: 'primary',
    prefix: '$',
    type: 'number',
    step: '0.01',
    min: '0',
  },
  discount: {
    label: 'Descuento',
    icon: PercentIcon,
    color: 'primary',
    suffix: '%',
    type: 'number',
    step: '1',
    min: '0',
    max: '100',
  },
  rewardPoints: {
    label: 'Recompensa',
    icon: StarIcon,
    color: 'primary',
    suffix: ' pts',
    type: 'number',
    step: '1',
    min: '0',
  },
  redeemPoints: {
    label: 'Canje',
    icon: GiftIcon,
    color: 'primary',
    suffix: ' pts',
    type: 'number',
    step: '1',
    min: '0',
  },
};

export const QuickEditPopover = ({
  open,
  anchorEl,
  onClose,
  showAlert,
  onSave,
  field,
  value,
  onChange,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const config = fieldConfig[field] || {};
  const IconComponent = config.icon || MoneyIcon;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = async () => {
    // Validaciones
    if (!localValue || localValue.toString().trim() === '') {
      showAlert('El valor no puede estar vacío', 'warning');
      return;
    }

    const numValue = Number.parseFloat(localValue);
    if (isNaN(numValue)) {
      showAlert('Ingresa un valor numérico válido', 'warning');
      return;
    }

    if (config.min !== undefined && numValue < Number.parseFloat(config.min)) {
      showAlert(`El valor mínimo es ${config.min}`, 'warning');
      return;
    }

    if (config.max !== undefined && numValue > Number.parseFloat(config.max)) {
      showAlert(`El valor máximo es ${config.max}`, 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(localValue);
      showAlert(`${config.label} actualizado correctamente`, 'success');
      onClose();
    } catch (error) {
      console.error('Error en handleSave:', error);
      showAlert(`Error al actualizar ${config.label.toLowerCase()}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleCancel = () => {
    setLocalValue(value); // Restaurar el valor original
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 2,
          border: '2px solid',
          borderColor: `${config.color}.main`,
          minWidth: '300px',
          maxWidth: '350px',
        },
      }}
    >
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconComponent
              sx={{ color: `${config.color}.main`, fontSize: '20px' }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'fontFamily.primary',
                color: 'text.primary',
                fontWeight: 'bold',
              }}
            >
              EDITAR {config?.label?.toUpperCase()}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleCancel}
            color="primary"
            disabled={isLoading}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Input field */}
        <Box>
          <Box sx={labelContainerStyle}>
            <Typography sx={labelStyle}>{config.label}</Typography>
          </Box>
          <TextField
            fullWidth
            type={config.type}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            autoFocus
            inputProps={{
              step: config.step,
              min: config.min,
              max: config.max,
            }}
            InputProps={{
              startAdornment: config.prefix && (
                <InputAdornment position="start">
                  <Typography
                    sx={{ color: `${config.color}.main`, fontWeight: 'bold' }}
                  >
                    {config.prefix}
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: config.suffix && (
                <InputAdornment position="end">
                  <Typography
                    sx={{ color: `${config.color}.main`, fontWeight: 'bold' }}
                  >
                    {config.suffix}
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyle}
          />
        </Box>

        {/* Action buttons */}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleCancel}
            size="small"
            disabled={isLoading}
            sx={{
              fontFamily: 'fontFamily.terciary',
              borderColor: `${config.color}.main`,
              '&:hover': {
                bgcolor: `${config.color}.dark`,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            size="small"
            disabled={isLoading}
            sx={{
              fontFamily: 'fontFamily.terciary',
              bgcolor: `${config.color}.main`,
              '&:hover': {
                bgcolor: `${config.color}.dark`,
              },
            }}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Stack>

        {/* Helper text */}
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'fontFamily.secondary',
            display: 'block',
            textAlign: 'center',
            color: 'text.primary',
            mt: 1,
            fontStyle: 'italic',
          }}
        >
          Presiona Enter para guardar o Esc para cancelar
        </Typography>
      </Paper>
    </Popover>
  );
};
