import { useEffect, useRef, useState } from "react";

// ---- Material UI ----
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
// ---------------------

export const ModalTotemMaintenance = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const operationRef = useRef(false);

  useEffect(() => {
    return window.totemAPI.onRequestExit(() => {
      if (operationRef.current) return;

      setPassword("");
      setError("");
      setOpen(true);
    });
  }, []);

  const close = () => {
    if (operationRef.current) return;

    setOpen(false);
    setPassword("");
    setError("");
  };

  const confirm = async (event) => {
    event.preventDefault();

    if (operationRef.current || !password) return;

    operationRef.current = true;
    setBusy(true);
    setError("");

    try {
      const response = await window.totemAPI.authorizeExit(password);

      if (!response?.ok) {
        setError(response?.message || "No se pudo cerrar el tótem");
      }
    } catch {
      setError("No se pudo verificar la autorización");
    } finally {
      setPassword("");
      operationRef.current = false;
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : close}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Typography
          sx={{ fontFamily: "fontFamily.primary", fontSize: "1.5rem" }}
        >
          CERRAR APLICACIÓN DEL TÓTEM
        </Typography>
      </DialogTitle>

      <form onSubmit={confirm}>
        <DialogContent dividers sx={{ bgcolor: "background.paper" }}>
          <Stack spacing={2}>
            <Alert severity="info">
              Ingresá la contraseña del administrador de este local.
            </Alert>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              autoFocus
              fullWidth
              type="password"
              label="Contraseña del administrador"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              autoComplete="off"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ bgcolor: "background.main" }}>
          <Button
            variant="contained"
            color="secondary"
            disabled={busy}
            onClick={close}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={busy || !password}
          >
            {busy ? "Verificando…" : "Cerrar aplicación"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
