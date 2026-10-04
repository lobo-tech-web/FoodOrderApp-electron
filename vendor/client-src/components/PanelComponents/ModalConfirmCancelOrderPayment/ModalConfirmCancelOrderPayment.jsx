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
  ArrowBack as ArrowBackIcon,
  MoneyOff as MoneyOffIcon,
  ReceiptLong as OrderIcon,
} from "@mui/icons-material";
// ----------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

export const ModalConfirmCancelOrderPayment = ({
  open,
  order,
  displayID,
  loading = false,
  onClose,
  onConfirm,
}) => {
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
          <Alert severity="warning" variant="standard">
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                textTransform: "uppercase",
              }}
            >
              El pedido volverá a quedar pendiente de pago.
            </Typography>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                textTransform: "uppercase",
              }}
            >
              El movimiento de cobro será anulado y dejará de contabilizarse en
              la caja.
            </Typography>
          </Alert>

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
              <Stack direction="row" spacing={1} alignItems="center">
                <OrderIcon color="primary" />

                <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                  PEDIDO #{displayID || order?.id}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
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
                  {order?.clientName || "SIN ESPECIFICAR"}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
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
                    textTransform: "uppercase",
                  }}
                >
                  {order?.paymentMethod || "SIN ESPECIFICAR"}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "primary.main",
                    borderBottom: "1px solid",
                  }}
                >
                  Total del pedido:
                </Typography>

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
