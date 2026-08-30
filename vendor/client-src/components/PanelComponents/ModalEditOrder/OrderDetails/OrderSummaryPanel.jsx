import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Divider,
  Chip,
} from "@mui/material";
// Icons
import {
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  Money as MoneyIcon,
  TwoWheeler as TwoWheelerIcon,
  Paid as PaidIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

// ---- Components ----
import { PrintTicket } from "../PrintTickets/PrintTickets.jsx";
import { PrintCookOrder } from "../PrintCookOrder/PrintCookOrder.jsx";
// --------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { orderTypeOptions } from "@/utils/components/OrderTypeUtils.jsx";
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
import { formatDate } from "@/utils/orderAuditUtils.js";
// ---------------

// ---- Styles ----
import { panelSx, actionButtonSx } from "../styles/modalEditOrder.styles.js";
// ----------------

export const OrderSummaryPanel = ({
  order,
  showOrderIndex,
  setShowPrinterConfig,
  finalOrderTotal,
  onChangeOrderStatus,
}) => {
  const getOrderTypeIcon = (type) => {
    return (
      orderTypeOptions.find((item) => item.value === type)?.icon || (
        <TwoWheelerIcon color="info" />
      )
    );
  };

  const getPaymentIcon = (method) => {
    return (
      paymentMethods.find((payment) => payment.value === method)?.icon || (
        <MoneyIcon color="warning" />
      )
    );
  };

  return (
    <Box
      sx={{
        position: { xs: "static", lg: "sticky" },
        top: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Paper elevation={0} sx={{ ...panelSx, p: 2.2 }}>
        <Stack spacing={1.5}>
          <Box>
            <PrintCookOrder
              order={order}
              orderIndex={showOrderIndex}
              onChangeOrderStatus={onChangeOrderStatus}
            />
          </Box>

          <Box>
            <PrintTicket
              order={order}
              orderIndex={showOrderIndex}
              restaurantName={order.restaurantName}
              onChangeOrderStatus={onChangeOrderStatus}
            />
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowPrinterConfig(true)}
            sx={{
              ...actionButtonSx,
              color: "text.primary",
              borderColor: "text.primary",
              bgcolor: "background.default",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(245,158,11,0.08)",
              },
            }}
          >
            Config. impresoras
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ ...panelSx, p: 2.5 }}>
        <Box
          sx={{
            width: 92,
            height: 92,
            mx: "auto",
            mb: 2,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            border: "1px solid",
            borderColor: "primary.main",
            color: "primary.main",
            boxShadow: "0 0 35px rgba(245,158,11,0.16)",
          }}
        >
          <ShoppingCartIcon color="primary" sx={{ fontSize: 38 }} />
        </Box>

        <Typography
          sx={{
            color: "text.primary",
            fontFamily: "fontFamily.primary",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Total del pedido
        </Typography>

        <Typography
          sx={{
            color: "primary.main",
            fontFamily: "fontFamily.primary",
            fontSize: { xs: 30, sm: 36 },
            textAlign: "center",
            mb: 1.5,
          }}
        >
          {formatCurrency(finalOrderTotal)}
        </Typography>

        {/* ESTADO DEL COBRO */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.8,
            mb: 2,
          }}
        >
          <Chip
            size="small"
            icon={order.isPaid ? <PaidIcon /> : <AccessTimeIcon />}
            label={
              order.isPaid
                ? "PEDIDO PAGADO"
                : order.status === "CANCELADO"
                  ? "NO COBRADO"
                  : "PAGO PENDIENTE"
            }
            color={
              order.isPaid
                ? "success"
                : order.status === "CANCELADO"
                  ? "default"
                  : "warning"
            }
            variant={order.isPaid ? "filled" : "outlined"}
            sx={{
              fontFamily: "fontFamily.primary",
              px: 0.5,
              "& .MuiChip-icon": {
                fontSize: 18,
              },
            }}
          />

          {order.isPaid && (
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: 11,
                textAlign: "center",
              }}
            >
              {order.paidAt
                ? `Cobrado el ${formatDate(order.paidAt)}`
                : "Cobro registrado"}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "text.primary", my: 2 }} />

        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            {getOrderTypeIcon(order.orderType)}
            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontFamily: "fontFamily.primary",
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                Tipo de entrega
              </Typography>

              <Typography
                sx={{
                  color: "text.primary",
                  fontFamily: "fontFamily.terciary",
                  fontWeight: 900,
                }}
              >
                {order.orderType || "-"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "text.primary" }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            {getPaymentIcon(order.paymentMethod)}
            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontFamily: "fontFamily.primary",
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                Método de pago
              </Typography>
              <Typography
                sx={{
                  color: "text.primary",
                  fontFamily: "fontFamily.terciary",
                  fontWeight: 900,
                }}
              >
                {order.paymentMethod || "-"}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};
