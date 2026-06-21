// components/CustomOptionsPanel/CustomOptionFormDialog.jsx
import { useState, useEffect, useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
// ICONS
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocalDining as LocalDiningIcon,
  AttachMoney as MoneyIcon,
  TaskAlt as TaskAltIcon,
  CheckBox as CheckBoxIcon,
  PlusOne as PlusOneIcon,
} from '@mui/icons-material';
// ---------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- SERVICES ----
import {
  postCreateCustomOptionServices,
  putUpdateCustomOptionServices,
} from '@/services/customOption.js';
// ------------------

// ---- STYLES ----
const textFieldStyle = {
  '& .MuiInputBase-root': {
    fontFamily: 'fontFamily.primary',
    fontSize: { xs: '14px', sm: '16px', md: '16px' },
    minHeight: { xs: '48px', sm: '56px', md: '56px' },
    color: 'text.primary',
    bgcolor: 'background.default',
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
  mb: 0,
};

const labelContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 1, sm: 1.5, md: 1 },
  mb: { xs: 1, sm: 1.5, md: 0.5 },
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

export const ModalCreateCustomOption = ({
  open,
  handleClose,
  showAlert,
  option,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const { userState } = useUser();
  const currentUser = useMemo(() => userState?.user || {}, [userState?.user]);

  // Estado local de la opción a crear/editar
  const [form, setForm] = useState({
    userId: '',
    id: '',
    name: '',
    type: 'unique',
    priority: 10,
    status: true,
    items: [],
  });

  const optionTypes = [
    {
      label: 'Seleccion única obligatoria',
      value: 'unique',
      icon: <TaskAltIcon color="primary" />,
    },
    {
      label: 'Seleccion múltiple',
      value: 'checkbox',
      icon: <CheckBoxIcon color="info" />,
    },
    {
      label: 'Opción incrementable',
      value: 'extra',
      icon: <PlusOneIcon color="success" />,
    },
  ];

  useEffect(() => {
    if (option) {
      // Copiar los datos recibidos para editar
      setForm({
        userId: currentUser.id || '',
        id: option.id,
        name: option.name,
        type: option.type,
        priority: option.priority,
        status: option.status,
        items: option.items.map((item) => ({
          id: item.id,
          name: item.name,
          extraCost: item.extraCost,
          status: item.status,
          priority: item.priority,
        })),
      });
    } else {
      // Reset para crear
      setForm({
        userId: currentUser.id || '',
        id: '',
        name: '',
        type: 'unique',
        priority: 10,
        status: true,
        items: [],
      });
    }
  }, [option, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const updatedItems = prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, items: updatedItems };
    });
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: null, name: '', extraCost: 0, status: true, priority: 10 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleNumberInput = (value) => {
    return value.replace(/[^0-9.]/g, '');
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!form.name.trim()) {
      alert('El nombre de la CustomOption es obligatorio');
      return;
    }
    if (form.items.some((item) => !item.name.trim())) {
      alert('Todos los ítems deben tener nombre');
      return;
    }

    const payload = {
      id: form.id,
      userId: form.userId,
      name: form.name,
      type: form.type,
      priority: Number(form.priority),
      status: form.status,
      items: form.items.map((item) => ({
        id: item.id,
        name: item.name,
        extraCost: Number(item.extraCost) || 0,
        status: item.status,
        priority: Number(item.priority) || 10,
      })),
    };

    setLoading(true);

    try {
      if (option) {
        await putUpdateCustomOptionServices(payload);
        showAlert('Personalización actualizada correctamente!', 'success');
      } else {
        await postCreateCustomOptionServices(payload);
        showAlert('Personalización creada correctamente!', 'success');
      }
      onSaved();
    } catch (error) {
      alert('Error al guardar la CustomOption:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: 'background.main',
          borderBottom: '1px solid',
          borderColor: 'rgba(184, 182, 186, 0.18)',
          p: { xs: 1.5, md: 2 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: { xs: 28, sm: 30 },
                height: { xs: 28, sm: 30 },
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'rgba(184, 182, 186, 0.22)',
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                flexShrink: 0,
              }}
            >
              <AddIcon fontSize="small" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Typography
                variant="h6"
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
                {option ? 'EDITAR PERSONALIZACIÓN' : 'CREAR PERSONALIZACIÓN'}
              </Typography>
              <LocalDiningIcon color="primary" />
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: { xs: 1.5, md: 2 },
          bgcolor: 'background.default',
          overflow: 'auto',
        }}
      >
        <Box sx={labelContainerStyle}>
          <Typography sx={labelStyle}>NOMBRE DE LA OPCIÓN</Typography>
        </Box>
        <TextField
          name="name"
          placeholder="Ej: Acompañamiento para tu producto"
          value={form.name}
          onChange={handleChange}
          required
          fullWidth
          sx={textFieldStyle}
        />

        <Box sx={labelContainerStyle}>
          <Typography sx={labelStyle}>TIPO DE OPCIÓN</Typography>
        </Box>
        <FormControl fullWidth sx={textFieldStyle}>
          <Select
            name="type"
            value={form.type}
            onChange={handleChange}
            sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
          >
            {optionTypes.map((type) => (
              <MenuItem key={type.label} value={type.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {type.icon}
                  <Typography
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      color: 'text.primary',
                    }}
                  >
                    {type.label}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={labelContainerStyle}>
            <Typography sx={labelStyle}>ESTADO</Typography>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.status}
                onChange={handleChange}
                name="status"
                sx={{
                  color: 'text.primary',
                  '&.Mui-checked': {
                    color: 'success.main',
                  },
                }}
              />
            }
            label={form.status ? 'Activado' : 'Desactivado'}
            sx={{
              fontFamily: 'fontFamily.terciary',
              color: form.status ? 'success.main' : 'error.main',
            }}
          />
        </Box>

        {/* Lista de ítems */}
        <Typography
          variant="subtitle1"
          sx={{ fontFamily: 'fontFamily.primary', mt: 2 }}
        >
          Ítems de la opción
        </Typography>
        {form.items.map((item, index) => (
          <Paper
            key={index}
            sx={{
              bgcolor: 'background.main',
              p: 2,
              mb: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              position: 'relative',
              border: '1px solid',
              borderColor: 'primary.main',
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleRemoveItem(index)}
              sx={{
                position: 'absolute',
                right: 4,
                top: 4,
                color: 'error.main',
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{ fontFamily: 'fontFamily.secondary' }}>
                Item # {index + 1}
              </Typography>
            </Box>

            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>Nombre del ítem</Typography>
            </Box>
            <TextField
              placeholder="Ej: Agregado de papas, bebida, etc."
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              fullWidth
              sx={textFieldStyle}
            />

            <Box sx={labelContainerStyle}>
              <MoneyIcon fontSize="small" />
              <Typography sx={labelStyle}>Costo adicional</Typography>
            </Box>
            <TextField
              type="text"
              value={item.extraCost}
              onChange={(e) =>
                handleItemChange(
                  index,
                  'extraCost',
                  handleNumberInput(e.target.value)
                )
              }
              inputProps={{
                inputMode: 'decimal',
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              fullWidth
              sx={textFieldStyle}
            />

            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>Prioridad de vista</Typography>
            </Box>
            <TextField
              type="number"
              value={item.priority}
              onChange={(e) =>
                handleItemChange(index, 'priority', e.target.value)
              }
              inputProps={{ min: 1, max: 999 }}
              fullWidth
              sx={textFieldStyle}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.status}
                  onChange={(e) =>
                    handleItemChange(index, 'status', e.target.checked)
                  }
                  sx={{
                    color: 'text.primary',
                    '&.Mui-checked': {
                      color: 'success.main',
                    },
                  }}
                />
              }
              label={item.status ? 'Activado' : 'Desactivado'}
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: item.status ? 'success.main' : 'error.main',
              }}
            />
          </Paper>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{ ...submitButtonStyle, mt: 2 }}
        >
          NUEVO ITEM
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={cancelButtonStyle}>
          Cancelar
        </Button>
        <Button
          disabled={loading}
          onClick={handleSubmit}
          variant="contained"
          sx={submitButtonStyle}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
