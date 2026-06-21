import { useState, useEffect } from 'react';
// ---- MATERIAL UI ----
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
// ICONS
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Restaurant as RestaurantIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
// ---------------------

// ---- HOOKS ----
import { useThermalPrinter } from './useThermalPrinter.js';
// ---------------

// ---- STYLES ----
const textFieldStyles = {
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

export const PrinterConfigModal = ({ open, onClose }) => {
  const {
    savedPrinters,
    isPrinting,
    printToThermal,
    savePrinterConfig,
    resetSavedPrinters,
  } = useThermalPrinter();

  const [ticket, setTicket] = useState({
    type: 'network',
    ip: '',
    port: 9100,
    name: 'Comanda Tickets',
  });

  const [kitchen, setKitchen] = useState({
    type: 'network',
    ip: '',
    port: 9100,
    name: 'Comanda Cocina',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const isValidIP = (ip) => {
    const pattern =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return pattern.test(ip);
  };

  const handleReset = () => {
    resetSavedPrinters();

    setTicket({
      type: 'network',
      ip: '',
      port: 9100,
      name: 'Comanda Tickets',
    });

    setKitchen({
      type: 'network',
      ip: '',
      port: 9100,
      name: 'Comanda Cocina',
    });

    // Feedback visual
    setSnackbar({
      open: true,
      message: '🗑️ Configuraciones de impresoras eliminadas.',
      severity: 'info',
    });
  };

  const handleSave = (type, printer) => {
    if (!isValidIP(printer.ip)) {
      setSnackbar({
        open: true,
        message: `Debes ingresar una IP válida para la impresora ${type}`,
        severity: 'error',
      });
      return;
    }
    savePrinterConfig(type, printer);
    setSnackbar({
      open: true,
      message: `✅ Configuración guardada para impresora ${type}`,
      severity: 'success',
    });
  };

  const handleTestPrinter = async (type) => {
    const testData = {
      orderIndex: 'TEST-001',
      clientName: 'Cliente de Prueba',
      deliveryAddress: 'Av. Colon 123456',
      orderType: 'Retiro en Local',
      cleanedTotalAmount: '25.50',
      items: [
        {
          quantity: 2,
          name: 'Hamburguesa Clásica',
          price: 12.0,
          notes: 'Sin cebolla',
        },
        { quantity: 1, name: 'Papas Fritas', price: 3.5 },
      ],
    };

    const success = await printToThermal(type, testData);
    setSnackbar({
      open: true,
      message: success
        ? `✅ Impresión de prueba exitosa en ${type}`
        : `❌ Error al imprimir en ${type}`,
      severity: success ? 'success' : 'error',
    });
  };

  useEffect(() => {
    if (open) {
      if (savedPrinters.ticket) {
        const { ip, port = 9100, name } = savedPrinters.ticket;
        setTicket({
          type: 'network',
          ip,
          port,
          name,
        });
      }
      if (savedPrinters.kitchen) {
        const { ip, port = 9100, name } = savedPrinters.kitchen;
        setKitchen({
          type: 'network',
          ip,
          port,
          name,
        });
      }
    }
  }, [open, savedPrinters]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'background.main',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" />
            <Typography
              variant="h6"
              sx={{ fontFamily: 'fontFamily.primary', color: 'primary.main' }}
            >
              CONFIGURACIÓN DE IMPRESORAS
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* CONFIGURACIÓN PARA TICKETS */}
          <Box sx={{ mt: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PrintIcon color="primary" />
              <Typography
                variant="h6"
                sx={{ fontFamily: 'fontFamily.primary' }}
              >
                IMPRESORA PARA TICKETS
              </Typography>
              {savedPrinters.ticket && (
                <Chip label="Guardada" color="success" size="small" />
              )}
            </Box>

            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>IP DE LA IMPRESORA</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="IP"
                value={ticket.ip}
                onChange={(e) => {
                  setTicket((prev) => ({
                    ...prev,
                    ip: e.target.value,
                  }));
                }}
                sx={textFieldStyles}
              />
            </Box>

            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>PUERTO DE LA IMPRESORA</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="PUERTO"
                type="number"
                value={ticket.port}
                onChange={(e) => {
                  setTicket((prev) => ({
                    ...prev,
                    port: e.target.value,
                  }));
                }}
                sx={textFieldStyles}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                disabled={isPrinting}
                variant="contained"
                onClick={() => handleSave('ticket', ticket)}
                sx={{ fontFamily: 'fontFamily.terciary' }}
              >
                Guardar
              </Button>
              <Button
                disabled={isPrinting}
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => handleTestPrinter('ticket')}
                sx={{ fontFamily: 'fontFamily.terciary' }}
              >
                Probar impresión
              </Button>
            </Box>
          </Box>

          <Divider sx={{ bgcolor: 'primary.main', mb: 2 }} />

          {/* CONFIGURACIÓN PARA COCINA */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <RestaurantIcon color="primary" />
              <Typography
                variant="h6"
                sx={{ fontFamily: 'fontFamily.primary' }}
              >
                IMPRESORA PARA COCINA
              </Typography>
              {savedPrinters.kitchen && (
                <Chip label="Guardada" color="success" size="small" />
              )}
            </Box>

            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>IP DE LA IMPRESORA</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="IP"
                value={kitchen.ip}
                onChange={(e) => {
                  setKitchen((prev) => ({
                    ...prev,
                    ip: e.target.value,
                  }));
                }}
                sx={textFieldStyles}
              />
            </Box>

            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>PUERTO DE LA IMPRESORA</Typography>
              </Box>

              <TextField
                fullWidth
                placeholder="PUERTO"
                type="number"
                value={kitchen.port}
                onChange={(e) => {
                  setKitchen((prev) => ({
                    ...prev,
                    port: e.target.value,
                  }));
                }}
                sx={textFieldStyles}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                disabled={isPrinting}
                variant="contained"
                onClick={() => handleSave('kitchen', kitchen)}
                sx={{ fontFamily: 'fontFamily.terciary' }}
              >
                Guardar
              </Button>
              <Button
                disabled={isPrinting}
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => handleTestPrinter('kitchen')}
                sx={{ fontFamily: 'fontFamily.terciary' }}
              >
                Probar impresión
              </Button>
            </Box>
          </Box>

          <Alert color="primary">
            NOTA: Se debe ingresar manualmente la **IP** y el **puerto**.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'background.default' }}>
          <Button
            disabled={isPrinting}
            onClick={onClose}
            variant="contained"
            color="secondary"
            sx={{ fontFamily: 'fontFamily.terciary' }}
          >
            Cerrar
          </Button>

          <Button
            disabled={isPrinting}
            onClick={handleReset}
            variant="contained"
            color="primary"
            sx={{ fontFamily: 'fontFamily.terciary' }}
          >
            Reestablecer impresoras
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};
