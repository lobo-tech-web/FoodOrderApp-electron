// ---- Material UI ----
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
// ICONS
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  RequestQuote as RequestQuoteIcon,
} from "@mui/icons-material";
// ---------------------

export const ModalConfirmCashClosure = ({
  open,
  onCancel,
  onConfirm,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          borderRadius: 3,
          border: "2px solid",
          borderColor: "primary.main",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "background.main",
          color: "text.primary",
          display: "flex",
          alignItems: "center",
          gap: 2,
          fontFamily: "fontFamily.primary",
          fontWeight: "bold",
          fontSize: isMobile ? "0.8rem" : "1rem",
        }}
      >
        <RequestQuoteIcon color="primary" />
        <Typography variant="h6">CONFIRMAR CIERRE DE TURNO</Typography>
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            fontSize: isMobile ? "0.8rem" : "1rem",
            mt: 2,
          }}
        >
          Al confirmar el cierre, los viajes quedarán marcados como pagados y no
          se podrán modificar.
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{ display: "flex", justifyContent: "flex-end", gap: 1, p: 2 }}
      >
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="contained"
          color="secondary"
          size={isMobile ? "small" : "medium"}
          startIcon={<CloseIcon />}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Volver
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="success"
          size={isMobile ? "small" : "medium"}
          startIcon={<CheckCircleIcon />}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Confirmar cierre
        </Button>
      </DialogActions>
    </Dialog>
  );
};
