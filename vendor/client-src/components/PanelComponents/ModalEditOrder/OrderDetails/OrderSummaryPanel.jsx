import { Box, Paper, Stack, Typography, Button, Divider } from "@mui/material";
// Icons
import {
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  Money as MoneyIcon,
  TwoWheeler as TwoWheelerIcon,
} from "@mui/icons-material";

// ---- Components ----
import { PrintTicket } from "../PrintTickets/PrintTickets.jsx";
import { PrintCookOrder } from "../PrintCookOrder/PrintCookOrder.jsx";
// --------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { orderTypeOptions } from "@/utils/components/OrderTypeUtils.jsx";
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
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
            fontWeight: 900,
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
            fontWeight: 900,
            fontSize: { xs: 30, sm: 36 },
            textAlign: "center",
            mb: 2,
          }}
        >
          {formatCurrency(finalOrderTotal)}
        </Typography>

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
