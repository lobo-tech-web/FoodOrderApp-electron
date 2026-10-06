// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  ReceiptLong as OrderIcon,
  Person as PersonIcon,
  Paid as PaidIcon,
  ArrowBack as ArrowBackIcon,
  MoneyOff as MoneyOffIcon,
} from "@mui/icons-material";
// ----------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
// ---------------

export const ModalConfirmCancelOrderPayment = ({
  open,
  order,
  displayID,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const findIcon = (value) => {
    return (
      paymentMethods.find((pay) => pay.value === value)?.icon || <PaidIcon />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
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
          <MoneyOffIcon color="error" />

          <Typography variant="h6" sx={{ fontFamily: "fontFamily.primary" }}>
            CANCELAR PAGO
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "background.default" }}>
        <Stack spacing={2}>
          <Alert severity="error" variant="standard">
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                textTransform: "uppercase",
              }}
            >
              ESTAS POR REVERTIR EL PAGO DE UN PEDIDO
            </Typography>
          </Alert>

          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "primary.main",
              fontSize: "0.9rem",
            }}
          >
            El pedido volverá a quedar pendiente de pago y el movimiento de
            cobro en caja quedara anulado, revisa si es correcta la información
            del pedido antes de continuar con el proceso.
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.main",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" justifyContent="space-around" spacing={1}>
              <Stack direction="column" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                    fontSize: "0.85rem",
                  }}
                >
                  PEDIDO
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <OrderIcon />

                  <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                    #{displayID || order?.id}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="column" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                    fontSize: "0.85rem",
                  }}
                >
                  CLIENTE
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon />

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      textTransform: "uppercase",
                    }}
                  >
                    {order?.clientName || "SIN ESPECIFICAR"}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="column" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                    fontSize: "0.85rem",
                  }}
                >
                  MÉTODO DE PAGO:
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  {findIcon(order?.paymentMethod)}
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      textTransform: "uppercase",
                    }}
                  >
                    {order?.paymentMethod || "SIN ESPECIFICAR"}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="column" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                    fontSize: "0.85rem",
                  }}
                >
                  TOTAL DEL PEDIDO:
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <PaidIcon />

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
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        disableSpacing
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <MoneyOffIcon />
            )
          }
          onClick={onConfirm}
          disabled={loading}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          {loading ? "Cancelando pago..." : "Cancelar pago"}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={onClose}
          disabled={loading}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Volver
        </Button>
      </DialogActions>
    </Dialog>
  );
};
