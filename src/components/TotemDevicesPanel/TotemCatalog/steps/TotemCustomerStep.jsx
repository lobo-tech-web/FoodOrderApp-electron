// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Stack,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import { ArrowBack, Payment } from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { cartTotals, money } from "../totemCart.js";
// ---------------

export const TotemCustomerStep = ({
  cart,
  form,
  setForm,
  customer,
  onBack,
  onPay,
  busy,
  error,
}) => {
  const totals = cartTotals(cart);

  const pointsValid =
    !totals.points || (customer && customer.points >= totals.points);
  const name = customer ? customer.name : form.name;

  return (
    <Box
      component="section"
      aria-labelledby="totem-customer-step-title"
      sx={{
        flex: "1 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 860 }}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
            border: "1px solid",
            borderColor: "primary.main",
            p: { xs: 2.5, sm: 4 },
          }}
        >
          <Stack spacing={3} sx={{ width: "100%", maxWidth: 720, m: "auto" }}>
            <Typography
              id="totem-customer-step-title"
              component="h1"
              sx={{
                fontFamily: "fontFamily.primary",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                color: "text.primary",
                textAlign: "center",
              }}
            >
              CONFIRMÁ TU PEDIDO
            </Typography>

            {customer && (
              <Alert severity="success">
                Cuenta identificada. {customer.points} puntos disponibles.
              </Alert>
            )}

            <TextField
              fullWidth
              label="Tu nombre"
              value={name}
              inputProps={{ maxLength: 110 }}
              InputProps={{ readOnly: Boolean(customer) }}
              disabled={busy}
              onChange={
                customer
                  ? undefined
                  : (event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
              }
            />

            {customer && (
              <TextField
                fullWidth
                label="DNI / CUIT / CUIL"
                value={customer.cuit}
                InputProps={{ readOnly: true }}
              />
            )}

            {totals.points > 0 && (
              <Alert severity={pointsValid ? "info" : "warning"}>
                {totals.points} puntos a canjear.
                {!pointsValid &&
                  " Tu cuenta no tiene puntos suficientes para este pedido. Volvé al carrito para modificarlo o cambiá la identificación."}
              </Alert>
            )}

            <Stack direction="row" justifyContent="space-between">
              <Typography
                variant="h6"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Total a pagar
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontFamily: "fontFamily.primary" }}
              >
                {money(totals.amount / 100)}
              </Typography>
            </Stack>

            {error && <Alert severity="warning">{error}</Alert>}

            <Button
              size="large"
              variant="contained"
              endIcon={<Payment />}
              disabled={busy || !name?.trim() || !pointsValid}
              onClick={onPay}
              sx={{ minHeight: 60 }}
            >
              {busy
                ? "Verificando compra..."
                : totals.amount
                  ? "Proceder a Pagar"
                  : "Confirmar canje"}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              disabled={busy}
              onClick={onBack}
              sx={{ minHeight: 48 }}
            >
              Cambiar identificación
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};
