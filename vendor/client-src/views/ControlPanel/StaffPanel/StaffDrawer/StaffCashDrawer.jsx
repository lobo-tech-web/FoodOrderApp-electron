// ---- Material UI ----
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
// Icons
import {
  PointOfSale as CashIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  LockClock as CloseIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { formatMoney, hasPermission } from "@/utils/cashRegisterUtils.js";
// ---------------

export const StaffCashDrawer = ({
  user,
  cashSession,
  onMovement,
  onCloseCash,
  onGoToOrders,
  onViewHistory,
}) => {
  const isCashOpen = cashSession?.id && cashSession?.status === "OPEN";
  const canMove = hasPermission(user, "cashRegister", "movements");
  const canClose = hasPermission(user, "cashRegister", "close");

  const canReadReport = hasPermission(user, "cashRegister", "readReport");

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: "background.main",
      }}
    >
      <Stack spacing={1.2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Stack direction="row" spacing={0.8} alignItems="center">
            <CashIcon
              fontSize="small"
              color={isCashOpen ? "success" : "disabled"}
            />

            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              CAJA
            </Typography>
          </Stack>

          <Chip
            size="small"
            color={isCashOpen ? "success" : "default"}
            label={isCashOpen ? "ABIERTA" : "CERRADA"}
            sx={{
              fontFamily: "fontFamily.secondary",
              fontWeight: "bold",
              fontSize: 10,
            }}
          />
        </Stack>

        {isCashOpen ? (
          <>
            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontFamily: "fontFamily.secondary",
                  fontSize: 11,
                }}
              >
                {cashSession.registerName || "Caja Principal"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  color: "text.primary",
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                Inicial {formatMoney(cashSession.openingAmount)}
              </Typography>
            </Box>

            {canMove && (
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="success"
                startIcon={<CurrencyExchangeIcon />}
                onClick={onMovement}
                sx={{ fontFamily: "fontFamily.primary" }}
              >
                Registrar movimiento
              </Button>
            )}

            {canClose && (
              <Button
                fullWidth
                size="small"
                variant="contained"
                color="warning"
                startIcon={<CloseIcon />}
                onClick={onCloseCash}
                sx={{ fontFamily: "fontFamily.primary" }}
              >
                Cerrar caja
              </Button>
            )}

            {canReadReport && (
              <Button
                fullWidth
                size="small"
                variant="text"
                onClick={onViewHistory}
                sx={{
                  fontFamily: "fontFamily.primary",
                }}
              >
                Ver registro de cajas
              </Button>
            )}
          </>
        ) : (
          <>
            <Typography
              sx={{
                color: "text.secondary",
                fontFamily: "fontFamily.secondary",
                fontSize: 11,
              }}
            >
              No hay una sesión de caja activa.
            </Typography>

            {user?.permissions?.cashRegister?.open === true && (
              <Button
                size="small"
                variant="text"
                onClick={onGoToOrders}
                sx={{
                  justifyContent: "flex-start",
                  px: 0,
                  fontFamily: "fontFamily.primary",
                }}
              >
                Abrir desde Pedidos
              </Button>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
};
