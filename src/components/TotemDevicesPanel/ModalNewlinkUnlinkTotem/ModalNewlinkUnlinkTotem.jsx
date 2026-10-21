// ---- Material UI ----
import {
  Alert,
  Box,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  ChangeCircle as ChangeCircleIcon,
  DesktopAccessDisabled as DesktopAccessDisabledIcon,
} from "@mui/icons-material";
// ---------------------

export const ModalNewlinkUnlinkTotem = ({
  open,
  onClose,
  confirmation,
  onSave,
  busy,
  error,
}) => {
  const isNewLink = confirmation?.action === "PAIR";

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ bgcolor: isNewLink ? "success.main" : "error.main" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {isNewLink ? <ChangeCircleIcon /> : <DesktopAccessDisabledIcon />}
          <Typography
            sx={{ fontFamily: "fontFamily.primary", fontSize: "1.2rem" }}
          >
            {isNewLink
              ? "GENERAR NUEVA VINCULACIÓN DEL TÓTEM"
              : "DESVINCULAR TÓTEM"}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
            Presiona confirmar si quieres seguir con el proceso
          </Typography>

          <Alert severity="warning" sx={{ borderRadius: 5 }}>
            Estas por desvincular el totem actual {confirmation?.device?.name}.
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: "background.main",
          display: "flex",
          flexDirection: "row",
          gap: 2,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          disabled={busy}
          onClick={onClose}
        >
          Volver
        </Button>

        <Button
          fullWidth
          variant="contained"
          color={isNewLink ? "success" : "error"}
          disabled={busy || !confirmation}
          onClick={onSave}
        >
          {isNewLink ? "Confirmar" : "Desvincular"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
