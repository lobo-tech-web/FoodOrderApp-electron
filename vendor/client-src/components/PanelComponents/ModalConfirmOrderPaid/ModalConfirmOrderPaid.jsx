import { useState, useEffect, useMemo } from "react";

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
  MenuItem,
  TextField,
} from "@mui/material";
import {
  Paid as PaidIcon,
  ReceiptLong as ReceiptLongIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
// -----------------------

const SPLIT_METHODS = ["EFECTIVO", "TRANSFERENCIA", "MERCADO PAGO", "TARJETA"];

const toCents = (value) => {
  const text = String(value ?? "")
    .trim()
    .replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  return Math.round(Number(text) * 100);
};

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
  enabledPaymentMethods = [],
}) => {
  const [parts, setParts] = useState([
    { method: "EFECTIVO", amount: "" },
    { method: "TRANSFERENCIA", amount: "" },
  ]);

  const isCombined = order?.paymentMethod === "COMBINADO";
  const totalCents = useMemo(
    () => toCents(order?.totalAmount),
    [order?.totalAmount],
  );

  const splitMethods = SPLIT_METHODS.filter((method) =>
    enabledPaymentMethods.includes(method),
  );
  const splitMethodsKey = splitMethods.join("|");

  useEffect(() => {
    if (!open) return;

    setParts(
      splitMethods.slice(0, 2).map((method) => ({
        method,
        amount: "",
      })),
    );
  }, [open, order?.id, splitMethodsKey]);

  const enteredCents = parts.map((part) => toCents(part.amount));
  const validSplit =
    isCombined &&
    totalCents !== null &&
    parts.length >= 2 &&
    parts.length <= 4 &&
    new Set(parts.map((part) => part.method)).size === parts.length &&
    enteredCents.every((amount) => amount !== null && amount > 0) &&
    enteredCents.reduce((sum, amount) => sum + amount, 0) === totalCents &&
    enabledPaymentMethods.includes("COMBINADO") &&
    splitMethods.length >= 2 &&
    parts.every((part) => splitMethods.includes(part.method));

  const updatePart = (index, field, value) => {
    setParts((current) =>
      current.map((part, position) =>
        position === index ? { ...part, [field]: value } : part,
      ),
    );
  };

  const confirmPayment = () => {
    if (isCombined) {
      if (!validSplit || loading) return;

      onConfirm(
        parts.map((part) => ({
          method: part.method,
          amount: (toCents(part.amount) / 100).toFixed(2),
        })),
      );
      return;
    }

    onConfirm();
  };

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

        {isCombined && (
          <Box sx={{ mt: 2, display: "grid", gap: 1.5 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontFamily: "fontFamily.primary" }}
            >
              INDICÁ CÓMO SE PAGÓ EL PEDIDO
            </Typography>

            {parts.map((part, index) => (
              <Box
                key={index}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <TextField
                  select
                  label="MÉTODO"
                  value={part.method}
                  disabled={loading}
                  onChange={(event) =>
                    updatePart(index, "method", event.target.value)
                  }
                  sx={{ fontFamily: "fontFamily.primary" }}
                >
                  {splitMethods.map((method) => (
                    <MenuItem
                      key={method}
                      value={method}
                      disabled={parts.some(
                        (other, position) =>
                          position !== index && other.method === method,
                      )}
                      sx={{ fontFamily: "fontFamily.primary" }}
                    >
                      {method}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="IMPORTE"
                  value={part.amount}
                  disabled={loading}
                  onChange={(event) =>
                    updatePart(index, "amount", event.target.value)
                  }
                  inputProps={{ inputMode: "decimal" }}
                  sx={{ fontFamily: "fontFamily.primary" }}
                />

                <Button
                  variant="text"
                  color="error"
                  disabled={loading || parts.length <= 2}
                  onClick={() =>
                    setParts((current) =>
                      current.filter((_, position) => position !== index),
                    )
                  }
                  sx={{ fontFamily: "fontFamily.primary" }}
                >
                  REMOVER
                </Button>
              </Box>
            ))}

            <Button
              variant="contained"
              disabled={loading || parts.length >= splitMethods.length}
              onClick={() => {
                const available = splitMethods.find(
                  (method) => !parts.some((part) => part.method === method),
                );
                if (available) {
                  setParts((current) => [
                    ...current,
                    { method: available, amount: "" },
                  ]);
                }
              }}
              sx={{ fontFamily: "fontFamily.primary", borderRadius: 5 }}
            >
              AGREGAR MÉTODO
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: validSplit ? "success.main" : "error.main",
                }}
              >
                INGRESADO:{" "}
                {formatCurrency(
                  enteredCents.reduce((sum, amount) => sum + (amount || 0), 0) /
                    100,
                )}
                {" · "}
                TOTAL: {formatCurrency(order?.totalAmount)}
              </Typography>
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
          onClick={confirmPayment}
          disabled={loading || (isCombined && !validSplit)}
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
