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
  Person as PersonIcon,
  ReceiptLong as OrderIcon,
  Paid as PaidIcon,
  MoneyOff as MoneyOffIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
// ----------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
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
  const findIcon = (value) => {
    return (
      paymentMethods.find((pay) => pay.value === value)?.icon || <PaidIcon />
    );
  };

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
              bgcolor: "background.main",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                  }}
                >
                  Cliente:
                </Typography>

                <PersonIcon fontSize="medium" />
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    textTransform: "uppercase",
                  }}
                >
                  {order?.clientName || "CLIENTE SIN ESPECIFICAR"}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
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
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                  }}
                >
                  Método de pago:
                </Typography>

                {findIcon(order?.paymentMethod)}
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                  }}
                >
                  {order?.paymentMethod || "SIN ESPECIFICAR"}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                  }}
                >
                  Total a pagar:
                </Typography>

                <PaidIcon color="success" />
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                    fontSize: "1.1rem",
                  }}
                >
                  {formatCurrency(order?.totalAmount || 0)}
                </Typography>
              </Stack>
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
