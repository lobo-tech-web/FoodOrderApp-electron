// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  ArrowBack as ArrowBackIcon,
  MoneyOff as MoneyOffIcon,
  Paid as PaidIcon,
  ReceiptLong as OrderIcon,
} from "@mui/icons-material";
// ----------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

export const ModalConfirmCreateOrderPaid = ({
  open,
  order,
  paymentRequired = false,
  canMarkPaid = false,
  loading = false,
  onCancel,
  onCreatePending,
  onContinueToPayment,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <OrderIcon color="primary" />

          <Typography variant="h6" sx={{ fontFamily: "fontFamily.primary" }}>
            CONFIRMAR PEDIDO
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "background.default" }}>
        <Stack spacing={2}>
          {!paymentRequired && (
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
              }}
            >
              Indicá si queres cobrar el pedido o dejarlo pendiente de cobro
            </Typography>
          )}

          {!canMarkPaid && paymentRequired && (
            <Alert severity="warning" variant="outlined">
              <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                No tenés permisos para registrar cobros. Modificá el estado o el
                tipo del pedido antes de continuar.
              </Typography>
            </Alert>
          )}

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "primary.main",
                    borderBottom: "1px solid",
                  }}
                >
                  Cliente:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    textTransform: "uppercase",
                  }}
                >
                  {order?.clientName || "CLIENTE SIN ESPECIFICAR"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "primary.main",
                    borderBottom: "1px solid",
                  }}
                >
                  Estado del pedido:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                  }}
                >
                  {order?.status || "SIN ESPECIFICAR"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "primary.main",
                    borderBottom: "1px solid",
                  }}
                >
                  Método de pago:
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                  }}
                >
                  {order?.paymentMethod || "SIN ESPECIFICAR"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "primary.main",
                    borderBottom: "1px solid",
                  }}
                >
                  Total a pagar:
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "success.main",
                    fontSize: "1.1rem",
                  }}
                >
                  {formatCurrency(order?.totalAmount || 0)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 1,
          "& > :not(style) ~ :not(style)": {
            marginLeft: 0,
          },
        }}
      >
        <Button
          startIcon={<PaidIcon />}
          variant="contained"
          color="success"
          disabled={loading || !canMarkPaid}
          onClick={onContinueToPayment}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          {paymentRequired ? "CONTINUAR AL PAGO" : "COBRAR PEDIDO"}
        </Button>

        {!paymentRequired && (
          <Button
            startIcon={<MoneyOffIcon />}
            variant="contained"
            color="warning"
            disabled={loading}
            onClick={onCreatePending}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            CREAR SIN COBRAR
          </Button>
        )}

        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          color="inherit"
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          VOLVER AL PEDIDO
        </Button>
      </DialogActions>
    </Dialog>
  );
};
