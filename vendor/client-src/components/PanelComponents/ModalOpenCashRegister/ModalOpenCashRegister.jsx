import { useState, useEffect } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Stack,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  TextField,
  CircularProgress,
} from "@mui/material";
// Icons
import {
  PointOfSale as PointOfSaleIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { initialCashForm } from "@/utils/cashRegisterUtils.js";
// ---------------

// ---- Styles ----
import {
  textFieldStyle,
  labelStyle,
  labelContainerStyle,
} from "./styles/styles.js";
// ----------------

export const ModalOpenCashRegister = ({
  open,
  saving,
  cashRegister,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialCashForm);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!cashRegister?.id) return;

    const openingAmount = Number(form.openingAmount || 0);

    if (!Number.isFinite(openingAmount) || openingAmount < 0) {
      return;
    }

    onSubmit({
      cashRegisterId: cashRegister.id,
      openingAmount,
      note: String(form.note || "").trim(),
    });
  };

  useEffect(() => {
    if (!open) return;

    setForm({
      ...initialCashForm,
      cashRegisterId: cashRegister?.id || "",
    });
  }, [open, cashRegister?.id]);

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PointOfSaleIcon color="primary" />

          <Box>
            <Typography variant="h6" sx={{ fontFamily: "fontFamily.primary" }}>
              ABRIR CAJA
            </Typography>

            {cashRegister && (
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  fontSize: 13,
                  color: "text.secondary",
                }}
              >
                {cashRegister.name}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default", pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {!cashRegister && (
            <Alert severity="warning">No hay una caja seleccionada.</Alert>
          )}

          <Box>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>MONTO INICIAL</Typography>
            </Box>
            <TextField
              value={form.openingAmount}
              onChange={(event) =>
                handleChange("openingAmount", event.target.value)
              }
              fullWidth
              type="number"
              inputProps={{
                min: 0,
                step: 0.01,
              }}
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
              onChange={(event) => handleChange("note", event.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={textFieldStyle}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "background.paper", p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          disabled={saving}
          onClick={onClose}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          disabled={saving || !cashRegister?.id}
          onClick={handleSubmit}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          {saving ? "Abriendo..." : "Abrir caja"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
