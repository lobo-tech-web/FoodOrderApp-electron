import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Restaurant as RestaurantIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useThermalPrinter } from "./useThermalPrinter.js";

const EMPTY_SELECTION = { ticket: "", kitchen: "" };

const getPrintResultMessage = (result) => {
  if (result?.printed) {
    return `Impresion enviada a ${result.printerName}.`;
  }
  if (result?.reason === "printer-not-found") {
    return "La impresora guardada ya no esta disponible en Windows.";
  }
  if (result?.reason === "printer-not-configured") {
    return "Primero selecciona y guarda una impresora.";
  }
  return result?.message || "No se pudo realizar la impresion de prueba.";
};

const buildTestHtml = (type) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Prueba de impresora</title>
    <style>
      @page { size: 80mm auto; margin: 3mm; }
      body { width: 72mm; margin: 0; color: #000; font: 14px/1.4 Arial, sans-serif; }
      h1, p { margin: 0 0 8px; }
      .center { text-align: center; }
      .line { border-top: 1px dashed #000; margin: 10px 0; }
    </style>
  </head>
  <body>
    <div class="center">
      <h1>PRUEBA DE IMPRESION</h1>
      <p>${type === "ticket" ? "TICKET DE CLIENTE" : "COMANDA DE COCINA"}</p>
      <div class="line"></div>
      <p>FoodOrderApp Admin</p>
      <p>${new Date().toLocaleString("es-AR")}</p>
    </div>
  </body>
</html>`;

const PrinterField = ({
  icon,
  label,
  type,
  value,
  printers,
  disabled,
  onChange,
  onSave,
  onTest,
}) => (
  <Box>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      {icon}
      <Typography sx={{ fontFamily: "fontFamily.primary" }}>{label}</Typography>
    </Stack>
    <FormControl fullWidth>
      <InputLabel
        id={`${type}-printer-label`}
        sx={{ fontFamily: "fontFamily.secondary" }}
      >
        Impresora de Windows
      </InputLabel>
      <Select
        labelId={`${type}-printer-label`}
        value={value}
        label="Impresora de Windows"
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {printers.map((printer) => (
          <MenuItem
            key={printer.name}
            value={printer.name}
            sx={{ fontFamily: "fontFamily.secondary" }}
          >
            {printer.displayName}
            {printer.isDefault ? " (Predeterminada)" : ""}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
      <Button
        variant="contained"
        disabled={disabled || !value}
        onClick={onSave}
        sx={{ fontFamily: "fontFamily.primary" }}
      >
        Guardar
      </Button>
      <Button
        variant="outlined"
        startIcon={<PrintIcon />}
        disabled={disabled || !value}
        onClick={onTest}
        sx={{ fontFamily: "fontFamily.primary" }}
      >
        Probar impresion
      </Button>
    </Stack>
  </Box>
);

export const PrinterConfigModal = ({ open, onClose }) => {
  const {
    availablePrinters,
    savedPrinters,
    isLoadingPrinters,
    isPrinting,
    printHtml,
    refreshPrinters,
    savePrinterConfig,
    resetSavedPrinters,
  } = useThermalPrinter();
  const [selection, setSelection] = useState(EMPTY_SELECTION);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (!open) return;
    setSelection({
      ticket: savedPrinters.ticket?.deviceName || "",
      kitchen: savedPrinters.kitchen?.deviceName || "",
    });
  }, [open, savedPrinters]);

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = async (type) => {
    const result = await savePrinterConfig(type, selection[type]);
    if (result?.saved) {
      showMessage("Configuracion de impresora guardada.");
    } else {
      showMessage("No se pudo guardar la impresora seleccionada.", "error");
    }
  };

  const handleTest = async (type) => {
    const saveResult = await savePrinterConfig(type, selection[type]);
    if (!saveResult?.saved) {
      showMessage("No se pudo guardar la impresora seleccionada.", "error");
      return;
    }

    const result = await printHtml(type, buildTestHtml(type));
    showMessage(
      getPrintResultMessage(result),
      result?.printed ? "success" : "error",
    );
  };

  const handleReset = async () => {
    const result = await resetSavedPrinters();
    if (result?.reset) {
      setSelection(EMPTY_SELECTION);
      showMessage("Configuraciones de impresoras eliminadas.", "info");
    }
  };

  const disabled = isLoadingPrinters || isPrinting;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "background.main",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <SettingsIcon color="primary" />
            <Typography sx={{ fontFamily: "fontFamily.primary" }}>
              CONFIGURACION DE IMPRESORAS
            </Typography>
          </Stack>
          <IconButton onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography
                variant="body2"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Selecciona impresoras instaladas en Windows.
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                La configuracion se guarda solamente en esta computadora.
              </Typography>
            </Alert>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={
                  isLoadingPrinters ? (
                    <CircularProgress size={18} />
                  ) : (
                    <RefreshIcon />
                  )
                }
                onClick={refreshPrinters}
                disabled={disabled}
                sx={{ fontFamily: "fontFamily.primary" }}
              >
                Actualizar impresoras
              </Button>
            </Box>

            {!isLoadingPrinters && availablePrinters.length === 0 && (
              <Alert severity="warning">
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "fontFamily.secondary" }}
                >
                  Windows no informo impresoras instaladas. Instala la impresora
                  y vuelve a actualizar la lista.
                </Typography>
              </Alert>
            )}

            <PrinterField
              icon={<PrintIcon color="primary" />}
              label="IMPRESORA PARA TICKETS"
              type="ticket"
              value={selection.ticket}
              printers={availablePrinters}
              disabled={disabled}
              onChange={(value) =>
                setSelection((current) => ({ ...current, ticket: value }))
              }
              onSave={() => handleSave("ticket")}
              onTest={() => handleTest("ticket")}
            />

            <PrinterField
              icon={<RestaurantIcon color="primary" />}
              label="IMPRESORA PARA COCINA"
              type="kitchen"
              value={selection.kitchen}
              printers={availablePrinters}
              disabled={disabled}
              onChange={(value) =>
                setSelection((current) => ({ ...current, kitchen: value }))
              }
              onSave={() => handleSave("kitchen")}
              onTest={() => handleTest("kitchen")}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            color="error"
            variant="contained"
            onClick={handleReset}
            disabled={disabled}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            Restablecer impresoras
          </Button>
          <Button
            variant="contained"
            onClick={onClose}
            disabled={disabled}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() =>
            setSnackbar((current) => ({ ...current, open: false }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
