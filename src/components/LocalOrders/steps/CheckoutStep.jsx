// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import {
  CheckCircle as SuccessIcon,
  Person as PersonIcon,
  CardGiftcard as CardGiftcardIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Helpers ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { TouchOption } from "../shared/TouchOption.jsx";
// -----------------

// ---- Styles ----
import { buttonStyle1 } from "../../styles/buttonStyle.js";
// ----------------

export const CheckoutStep = ({
  checkout,
  onCheckoutChange,
  paymentMethods,
  totals,
  discountAmount = 0,
  totalAmount,
  submitError,
  loading,
  onCreateOrder,
}) => {
  const hasDiscount = Number(discountAmount || 0) > 0;
  const finalTotal = hasDiscount ? totalAmount : totals.subtotalProducts;
  return (
    <Box
      sx={{
        bgcolor: "background.main",
        flex: 1,
        overflow: "auto",
        p: 2,
      }}
    >
      <Box sx={{ width: "min(920px, 100%)", mx: "auto" }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "fontFamily.primary",
            fontSize: { xs: "1.7rem", md: "2.2rem" },
            color: "primary.main",
          }}
        >
          FINALIZAR PEDIDO
        </Typography>
        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            mt: 0.5,
            mb: 3,
          }}
        >
          Completa los datos para confirmar.
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            bgcolor: "background.paper",
            p: { xs: 2, md: 3 },
            mb: 2,
            borderRadius: 4,
          }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              fontSize: "1.15rem",
              color: "primary.main",
              mb: 2,
            }}
          >
            MÉTODO DE PAGO
          </Typography>
          {paymentMethods.length === 0 ? (
            <Alert severity="warning">
              Este comercio no tiene medios de pago habilitados.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {paymentMethods.map((method) => (
                <TouchOption
                  key={method.value}
                  icon={method.icon}
                  title={method.label}
                  active={checkout.paymentMethod === method.value}
                  onClick={() =>
                    onCheckoutChange({
                      ...checkout,
                      paymentMethod: method.value,
                    })
                  }
                />
              ))}
            </Box>
          )}
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, md: 3 }, mb: 2, borderRadius: 4 }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              fontSize: "1.15rem",
              color: "primary.main",
              mb: 2,
            }}
          >
            DATOS DEL CLIENTE
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                <PersonIcon color="primary" />
                <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                  Nombre del cliente
                </Typography>
              </Box>
              <TextField
                fullWidth
                required
                value={checkout.clientName}
                onChange={(event) =>
                  onCheckoutChange({
                    ...checkout,
                    clientName: event.target.value,
                  })
                }
                inputProps={{ style: { fontSize: 18 } }}
                sx={{ fontFamily: "fontFamily.secondary" }}
              />
            </Box>

            <Box>
              <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                <CardGiftcardIcon color="primary" />
                <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                  Número de usuario (opcional)
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Sólo usuarios registrados."
                value={checkout.userNumber}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    onCheckoutChange({ ...checkout, userNumber: value });
                  }
                }}
                inputMode="numeric"
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontFamily: "fontFamily.secondary", mt: 1 }}
              >
                Solo es necesario si queres sumar los puntos de este pedido y
                estás registrado en la página.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Paper
          sx={{
            bgcolor: "background.main",
            p: 2,
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "primary.main",
          }}
        >
          <Box sx={{ minWidth: { sm: 280 } }}>
            <Typography
              sx={{ fontFamily: "fontFamily.primary", color: "primary.main" }}
            >
              TOTAL DEL PEDIDO
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: "2rem",
                ml: hasDiscount ? "auto" : 0,
              }}
            >
              {formatCurrency(finalTotal)}
            </Typography>
          </Box>
          <Button
            size="large"
            variant="contained"
            onClick={onCreateOrder}
            disabled={loading || paymentMethods.length === 0}
            startIcon={
              loading ? <CircularProgress size={20} /> : <SuccessIcon />
            }
            sx={buttonStyle1}
          >
            {loading ? "Creando pedido..." : "Crear pedido"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};
