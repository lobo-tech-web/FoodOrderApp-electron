// ---- Material UI ----
import {
  Alert,
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
  pendingOrders = [],
  onCancel,
  onConfirm,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const hasPendingOrders = pendingOrders.length > 0;

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
        <Typography
          sx={{ fontFamily: "fontFamily.primary", fontSize: "1.2rem" }}
        >
          CONFIRMAR CIERRE DE TURNO
        </Typography>
      </DialogTitle>

      <DialogContent>
        {hasPendingOrders && (
          <Alert severity="warning" variant="standard" sx={{ mt: 2 }}>
            <Typography sx={{ fontFamily: "fontFamily.primary", mb: 1 }}>
              EL RIDER TIENE {pendingOrders.length} PEDIDO(S) PENDIENTE(S).
            </Typography>

            {pendingOrders.map((order) => (
              <Typography
                key={order.id}
                variant="body2"
                sx={{
                  fontFamily: "fontFamily.secondary",
                  textTransform: "uppercase",
                }}
              >
                PEDIDO #{order.dailyOrderNumber ?? order.id}
                {" · "}
                {order.clientName}
                {" · "}
                {order.status}
              </Typography>
            ))}

            <Typography
              variant="body2"
              sx={{ fontFamily: "fontFamily.secondary", mt: 1 }}
            >
              Podés volver para resolverlos o cerrar igualmente las entregas
              finalizadas.
            </Typography>

            <Typography
              variant="body2"
              sx={{ fontFamily: "fontFamily.secondary", mt: 1 }}
            >
              Los pedidos pendientes quedarán fuera de este cierre.
            </Typography>
          </Alert>
        )}

        <DialogContentText
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            fontSize: isMobile ? "0.8rem" : "1rem",
            mt: 2,
          }}
        >
          Al confirmar, las entregas finalizadas incluidas quedarán liquidadas y
          sus importes se conservarán en este cierre.
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
          {hasPendingOrders ? "Volver para resolver pedidos" : "Volver"}
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
          {hasPendingOrders ? "Cerrar igualmente" : "Confirmar cierre"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
