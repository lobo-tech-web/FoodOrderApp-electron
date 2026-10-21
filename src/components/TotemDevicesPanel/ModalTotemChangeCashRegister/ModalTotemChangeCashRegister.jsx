// ---- Material UI ----
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import { PointOfSale as PointOfSaleIcon } from "@mui/icons-material";
// ---------------------

export const ModalTotemChangeCashRegister = ({
  open,
  onClose,
  registerDevice,
  assignedRegisterId,
  onRegisterChange,
  activeRegisters = [],
  onSave,
  busy,
  error,
}) => {
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PointOfSaleIcon />

          <Typography
            sx={{ fontFamily: "fontFamily.primary", fontSize: "1.4rem" }}
          >
            CAMBIAR CAJA · {registerDevice?.name}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default" }}>
        <Stack spacing={2} sx={{ pt: 2 }}>
          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "primary.main",
            }}
          >
            Los próximos pedidos del tótem se registrarán en la caja
            seleccionada.
          </Typography>

          <TextField
            select
            label="Caja asignada"
            fullWidth
            value={assignedRegisterId}
            onChange={(event) => onRegisterChange(event.target.value)}
            disabled={busy}
          >
            {activeRegisters.map((register) => (
              <MenuItem key={register.id} value={register.id}>
                {register.name} · {register.code}
              </MenuItem>
            ))}
          </TextField>

          <Alert severity="info">
            La caja debe estar activa. Antes de cobrar, deberá tener una sesión
            abierta. Si hay una compra pendiente, finalizala antes de cambiar la
            caja.
          </Alert>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "background.main" }}>
        <Button disabled={busy} onClick={onClose}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          disabled={
            busy ||
            !registerDevice ||
            !activeRegisters.some(
              (register) => register.id === assignedRegisterId,
            ) ||
            assignedRegisterId === registerDevice?.cashRegisterId
          }
          onClick={onSave}
        >
          Guardar caja
        </Button>
      </DialogActions>
    </Dialog>
  );
};
