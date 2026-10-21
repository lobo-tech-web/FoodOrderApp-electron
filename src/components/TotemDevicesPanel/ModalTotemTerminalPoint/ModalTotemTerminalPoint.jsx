// ---- Material UI ----
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
// ---------------------

export const ModalTotemTerminalPoint = ({
  open,
  onClose,
  pointDevice,
  pointTerminalId = "",
  setPointTerminalId,
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
        <Typography
          sx={{ fontFamily: "fontFamily.primary", fontSize: "1.5rem" }}
        >
          TERMINAL POINT · {pointDevice?.name}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default" }}>
        <TextField
          label="ID de la terminal Point"
          fullWidth
          value={pointTerminalId}
          onChange={(event) => setPointTerminalId(event.target.value)}
          disabled={busy}
          inputProps={{ maxLength: 100 }}
          sx={{ mt: 1 }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ bgcolor: "background.main" }}>
        <Button
          variant="contained"
          color="secondary"
          disabled={busy}
          onClick={onClose}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={busy || !pointDevice || !pointTerminalId.trim()}
          onClick={onSave}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
