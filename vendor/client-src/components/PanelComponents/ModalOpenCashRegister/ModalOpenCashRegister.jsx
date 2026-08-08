import { useState, useEffect } from 'react';

// ---- Material UI ----
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
// Icons
import {
  PointOfSale as PointOfSaleIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
// ---------------------

// ---- Utils ----
import { initialCashForm } from '@/utils/cashRegisterUtils.js';
// ---------------

// ---- Styles ----
import {
  textFieldStyle,
  labelStyle,
  labelContainerStyle,
} from './styles/styles.js';
// ----------------

export const ModalOpenCashRegister = ({ open, saving, onClose, onSubmit }) => {
  const [form, setForm] = useState(initialCashForm);

  useEffect(() => {
    if (open) {
      setForm(initialCashForm);
    }
  }, [open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const openingAmount = Number(form.openingAmount || 0);

    if (openingAmount < 0) return;

    onSubmit({
      registerCode: String(form.registerCode || 'MAIN')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_'),
      registerName: String(form.registerName || 'Caja Principal'),
      openingAmount,
      note: String(form.note || ''),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'background.main' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PointOfSaleIcon color="primary" />

          <Typography
            variant="h6"
            sx={{
              fontFamily: 'fontFamily.primary',
              fontWeight: 'bold',
            }}
          >
            ABRIR CAJA
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: 'background.default', pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>CÓDIGO DE CAJA</Typography>
            </Box>
            <TextField
              value={form.registerCode}
              onChange={(event) =>
                handleChange('registerCode', event.target.value)
              }
              fullWidth
              helperText="Ejemplo: MAIN, CAJA_1, BARRA"
              sx={textFieldStyle}
            />
          </Box>

          <Box>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>NOMBRE DE CAJA</Typography>
            </Box>
            <TextField
              value={form.registerName}
              onChange={(event) =>
                handleChange('registerName', event.target.value)
              }
              fullWidth
              helperText="Nombre visible para el usuario"
              sx={textFieldStyle}
            />
          </Box>

          <Box>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>MONTO INICIAL</Typography>
            </Box>
            <TextField
              value={form.openingAmount}
              onChange={(event) =>
                handleChange('openingAmount', event.target.value)
              }
              fullWidth
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={textFieldStyle}
            />
          </Box>

          <Box>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>NOTA OPCIONAL</Typography>
            </Box>
            <TextField
              value={form.note}
              onChange={(event) => handleChange('note', event.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={textFieldStyle}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ bgcolor: 'background.paper', p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ fontFamily: 'fontFamily.primary' }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving}
          onClick={handleSubmit}
          sx={{ fontFamily: 'fontFamily.primary' }}
        >
          {saving ? 'Abriendo...' : 'Abrir caja'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
