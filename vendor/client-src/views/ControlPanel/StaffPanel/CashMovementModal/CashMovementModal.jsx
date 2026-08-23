import { useState, useEffect, useMemo } from "react";

// ---- Material UI ----
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

// Icons
import {
  Save as SaveIcon,
  CurrencyExchange as CurrencyExchangeIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Services ----
import { createCashMovementService } from "@/services/cashRegister.js";
// ------------------

const initialForm = {
  type: "CASH_IN",
  amount: "",
  reason: "",
};

const hasCashPermission = (user, permission) => {
  if (user?.role === "admin") return true;

  return (
    user?.role === "staff" &&
    user?.permissions?.cashRegister?.[permission] === true
  );
};

export const CashMovementModal = ({
  open,
  onClose,
  user,
  cashSession,
  showAlert,
  onMovementCreated,
}) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const canCreateMovement = useMemo(
    () => hasCashPermission(user, "movements"),
    [user],
  );

  const isCashOpen = cashSession?.id && cashSession?.status === "OPEN";

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!isCashOpen) {
      showAlert?.("No hay una caja abierta", "warning");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      showAlert?.("Ingresá un monto válido mayor a cero", "warning");
      return;
    }

    if (!form.reason.trim()) {
      showAlert?.("Ingresá el motivo del movimiento", "warning");
      return;
    }

    setSaving(true);

    try {
      const response = await createCashMovementService({
        cashSessionId: cashSession.id,
        type: form.type,
        amount,
        reason: form.reason.trim(),
      });

      showAlert?.(
        form.type === "CASH_IN"
          ? "Ingreso de caja registrado correctamente"
          : "Retiro de caja registrado correctamente",
        "success",
      );

      onMovementCreated?.(response);
      setForm(initialForm);
      onClose?.();
    } catch (error) {
      showAlert?.(error?.message || "Error al registrar movimiento", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setForm({
      ...initialForm,
    });
  }, [open]);

  if (!canCreateMovement) return null;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CurrencyExchangeIcon
            sx={{
              color: form.type === "CASH_IN" ? "success.main" : "error.main",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "fontFamily.primary",
              color: form.type === "CASH_IN" ? "success.main" : "error.main",
            }}
          >
            {form.type === "CASH_IN" ? "INGRESO DE CAJA" : "RETIRO DE CAJA"}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default", pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <ToggleButtonGroup
            value={form.type}
            exclusive
            fullWidth
            onChange={(_, value) => {
              if (value) {
                handleChange("type", value);
              }
            }}
          >
            <ToggleButton
              value="CASH_IN"
              sx={{ fontFamily: "fontFamily.secondary" }}
            >
              Ingreso
            </ToggleButton>

            <ToggleButton
              value="CASH_OUT"
              sx={{ fontFamily: "fontFamily.secondary" }}
            >
              Retiro
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Monto"
            type="number"
            value={form.amount}
            onChange={(event) => handleChange("amount", event.target.value)}
            inputProps={{
              min: 0,
              step: 0.01,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            sx={{ fontFamily: "fontFamily.secondary" }}
          />

          <TextField
            label="Motivo"
            value={form.reason}
            onChange={(event) => handleChange("reason", event.target.value)}
            multiline
            minRows={3}
            placeholder={
              form.type === "CASH_IN"
                ? "Ej: ingreso de cambio"
                : "Ej: pago a proveedor"
            }
            sx={{ fontFamily: "fontFamily.secondary" }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={saving}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color={form.type === "CASH_IN" ? "success" : "error"}
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          {saving ? "Guardando..." : "Registrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
