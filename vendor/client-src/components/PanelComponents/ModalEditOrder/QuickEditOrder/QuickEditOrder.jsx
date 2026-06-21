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
  Person as PersonIcon,
  Email as EmailIcon,
  Smartphone as PhoneIcon,
  Home as HomeIcon,
  Notes as NotesIcon,
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
  clientName: {
    label: 'Nombre del cliente',
    icon: PersonIcon,
    color: 'primary',
    type: 'text',
    valueType: 'text',
    required: true,
  },
  clientEmail: {
    label: 'Email del cliente',
    icon: EmailIcon,
    color: 'primary',
    type: 'email',
    valueType: 'email',
    required: true,
  },
  contactPhone: {
    label: 'Teléfono',
    icon: PhoneIcon,
    color: 'primary',
    type: 'text',
    valueType: 'text',
    required: true,
  },
  deliveryAddress: {
    label: 'Dirección',
    icon: HomeIcon,
    color: 'primary',
    type: 'text',
    valueType: 'text',
    required: false,
    multiline: true,
    minRows: 2,
    maxRows: 4,
  },
  productComment: {
    label: 'Comentario del producto',
    icon: NotesIcon,
    color: 'primary',
    type: 'text',
    valueType: 'text',
    required: false,
    allowEmpty: true,
    multiline: true,
    minRows: 3,
    maxRows: 5,
  },
};

export const QuickEditOrder = ({
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

  const config = fieldConfig[field] || {
    label: 'Campo',
    icon: MoneyIcon,
    color: 'primary',
    type: 'text',
    valueType: 'text',
    required: false,
  };
  const IconComponent = config.icon || MoneyIcon;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    const rawValue = localValue ?? '';
    const trimmedValue = rawValue.toString().trim();

    if (config.required && trimmedValue === '') {
      showAlert('El valor no puede estar vacío', 'warning');
      return;
    }

    let finalValue = rawValue;

    if (config.valueType === 'number') {
      const numValue = Number.parseFloat(rawValue);

      if (isNaN(numValue)) {
        showAlert('Ingresa un valor numérico válido', 'warning');
        return;
      }

      if (
        config.min !== undefined &&
        numValue < Number.parseFloat(config.min)
      ) {
        showAlert(`El valor mínimo es ${config.min}`, 'warning');
        return;
      }

      if (
        config.max !== undefined &&
        numValue > Number.parseFloat(config.max)
      ) {
        showAlert(`El valor máximo es ${config.max}`, 'warning');
        return;
      }

      finalValue = numValue;
    }

    if (config.valueType === 'email' && trimmedValue !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(trimmedValue)) {
        showAlert('Ingresa un email válido', 'warning');
        return;
      }

      finalValue = trimmedValue;
    }

    if (config.valueType === 'text') {
      finalValue = config.allowEmpty ? rawValue.toString() : trimmedValue;
    }

    setIsLoading(true);

    try {
      onSave(finalValue);
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
      if (config.multiline) {
        if (event.ctrlKey || event.metaKey) {
          handleSave();
        }
        return;
      }
      handleSave();
    }

    if (event.key === 'Escape') {
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
            type={config.type || 'text'}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            autoFocus
            multiline={Boolean(config.multiline)}
            minRows={config.minRows || 1}
            maxRows={config.maxRows || 1}
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
          {config.multiline
            ? 'Presiona Ctrl + Enter para guardar o Esc para cancelar'
            : 'Presiona Enter para guardar o Esc para cancelar'}
        </Typography>
      </Paper>
    </Popover>
  );
};
