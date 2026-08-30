// ---- MATERIAL UI ----
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  Paid as PaidIcon,
  ReceiptLong as ReceiptLongIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
// -----------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
// ---------------

export const ModalConfirmOrderPaid = ({
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
        elevation: 0,
        sx: {
          borderRadius: 3,
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "background.main",
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <PaidIcon />
          <Typography variant="h6" sx={{ fontFamily: "fontFamily.primary" }}>
            CONFIRMAR PAGO
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography
          sx={{
            fontFamily: "fontFamily.primary",
            color: "text.primary",
            fontSize: "1.1rem",
          }}
        >
          VERIFICA LA INFORMACIÓN ANTES DE CONFIRMAR EL PEDIDO COMO PAGO
        </Typography>

        {order && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 12,
                }}
              >
                PEDIDO
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <ReceiptLongIcon />
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                  }}
                >
                  #{displayID || order?.id || "SIN ESPECIFICAR"}
                </Typography>
              </Box>
            </Box>

            {/* CLIENTE */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 12,
                }}
              >
                CLIENTE
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <PersonIcon />
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                    fontWeight: 800,
                  }}
                >
                  {order.clientName || "SIN ESPECIFICAR"}
                </Typography>
              </Box>
            </Box>

            {/* MÉTODO DE PAGO */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 12,
                }}
              >
                MÉTODO DE PAGO
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                {findIcon(order.paymentMethod)}
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                  }}
                >
                  {order.paymentMethod || "SIN ESPECIFICAR"}
                </Typography>
              </Box>
            </Box>

            {/* TOTAL */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 12,
                }}
              >
                TOTAL A PAGAR
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <PaidIcon color="success" />
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                    fontWeight: 800,
                  }}
                >
                  {formatCurrency(order.totalAmount) || "SIN ESPECIFICAR"}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          color="inherit"
          sx={{
            fontFamily: "fontFamily.primary",
          }}
        >
          Cancelar
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="success"
          sx={{
            fontFamily: "fontFamily.primary",
            minWidth: 155,
          }}
        >
          {loading ? (
            <CircularProgress size={19} color="inherit" />
          ) : (
            "MARCAR PAGADO"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
