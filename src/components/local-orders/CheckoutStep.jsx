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
import {
  CheckCircle as SuccessIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { formatCurrency } from "@/utils/orderCalculations.js";
import { TouchOption } from "./TouchOption.jsx";

export const CheckoutStep = ({
  checkout,
  onCheckoutChange,
  paymentMethods,
  totals,
  submitError,
  loading,
  onCreateOrder,
}) => (
  <Box
    sx={{
      bgcolor: "background.main",
      flex: 1,
      overflow: "auto",
      p: { xs: 2, md: 4 },
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
        sx={{ bgcolor: "background.paper", p: { xs: 2, md: 3 }, mb: 2 }}
      >
        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            fontSize: "1.15rem",
            mb: 2,
          }}
        >
          Seleccioná como queres pagar
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

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
        <Typography
          sx={{
            fontFamily: "fontFamily.primary",
            fontSize: "1.15rem",
            mb: 2,
          }}
        >
          DATOS DEL CLIENTE
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            required
            label="Nombre del cliente"
            value={checkout.clientName}
            onChange={(event) =>
              onCheckoutChange({
                ...checkout,
                clientName: event.target.value,
              })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
            inputProps={{ style: { fontSize: 18 } }}
          />
          <TextField
            fullWidth
            label="Numero de usuario LoboTech (opcional)"
            value={checkout.userNumber}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                onCheckoutChange({ ...checkout, userNumber: value });
              }
            }}
            helperText="Solo es necesario si queres sumar los puntos de este pedido."
            inputMode="numeric"
            inputProps={{ style: { fontSize: 18 } }}
          />
        </Stack>
      </Paper>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Paper
        sx={{
          p: 2,
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            color="text.secondary"
            sx={{ fontFamily: "fontFamily.primary", color: "text.primary" }}
          >
            TOTAL DEL PEDIDO
          </Typography>
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "primary.main",
              fontSize: "2rem",
            }}
          >
            {formatCurrency(totals.subtotalProducts)}
          </Typography>
        </Box>
        <Button
          size="large"
          variant="contained"
          onClick={onCreateOrder}
          disabled={loading || paymentMethods.length === 0}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SuccessIcon />
            )
          }
          sx={{
            fontFamily: "fontFamily.primary",
            minHeight: 58,
            px: 4,
            color: "text.terciary",
            fontSize: "1rem",
          }}
        >
          {loading ? "Creando pedido..." : "Crear pedido"}
        </Button>
      </Paper>
    </Box>
  </Box>
);
