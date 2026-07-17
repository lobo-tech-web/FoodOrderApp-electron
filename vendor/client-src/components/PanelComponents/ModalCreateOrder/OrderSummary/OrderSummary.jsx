import { Paper, Box, Typography, Divider } from "@mui/material";
import { BarChart as BarChartIcon } from "@mui/icons-material";
import { cleanMoneyValue, formatCurrency } from "@/utils/orderCalculations.js";

const SummaryRow = ({ label, value, strong = false }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1.5,
      py: 1.35,
      borderBottom: "1px dashed",
      borderColor: "rgba(184, 182, 186, 0.18)",
    }}
  >
    <Typography
      sx={{
        fontFamily: "fontFamily.primary",
        color: "text.primary",
        fontSize: { xs: "12px", md: "13px" },
        lineHeight: 1,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontFamily: "fontFamily.terciary",
        color: "primary.main",
        fontSize: strong
          ? { xs: "17px", md: "20px" }
          : { xs: "15px", md: "17px" },
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  </Box>
);

export const OrderSummary = ({
  order,
  calculatedProductTotals,
  calculatedDiscount,
  finalOrderTotal,
}) => {
  const discountLabel =
    calculatedDiscount.discountPercentage > 0
      ? "DESCUENTO (" + calculatedDiscount.discountPercentage + "%)"
      : "DESCUENTO";
  const discountValue =
    calculatedDiscount.discountamount > 0
      ? "-" + formatCurrency(calculatedDiscount.discountamount)
      : formatCurrency(0);

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "rgba(184, 182, 186, 0.22)",
        borderRadius: "8px",
        p: { xs: 1.75, md: 2.25 },
        minHeight: { lg: 520 },
        position: { lg: "sticky" },
        top: 16,
        boxShadow: "0 18px 50px rgba(0, 0, 0, 0.24)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2.5 }}>
        <BarChartIcon sx={{ color: "primary.main", fontSize: 26 }} />
        <Typography
          sx={{
            fontFamily: "fontFamily.primary",
            color: "text.primary",
            fontSize: { xs: "18px", sm: "21px" },
            lineHeight: 1,
          }}
        >
          RESUMEN DE TOTALES
        </Typography>
      </Box>

      <SummaryRow
        label="SUBTOTAL PRODUCTOS"
        value={formatCurrency(calculatedProductTotals.subtotalProducts)}
      />
      <SummaryRow label={discountLabel} value={discountValue} />
      <SummaryRow
        label="TARIFA DE SERVICIOS"
        value={formatCurrency(order.servicetax)}
      />
      <SummaryRow
        label="DELIVERY"
        value={formatCurrency(cleanMoneyValue(order.deliverycost))}
      />

      <Divider sx={{ my: 2.25, borderColor: "rgba(184, 182, 186, 0.18)" }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: "fontFamily.primary",
            color: "text.primary",
            fontSize: { xs: "18px", md: "20px" },
            lineHeight: 1,
          }}
        >
          TOTAL
        </Typography>
        <Typography
          sx={{
            fontFamily: "fontFamily.terciary",
            color: "primary.main",
            fontSize: { xs: "26px", md: "30px" },
            lineHeight: 0.9,
            whiteSpace: "nowrap",
          }}
        >
          {formatCurrency(finalOrderTotal)}
        </Typography>
      </Box>

      <Divider sx={{ my: 2.25, borderColor: "rgba(184, 182, 186, 0.18)" }} />

      {calculatedProductTotals.totalRewardPoints > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.secondary",
              fontSize: { xs: "10px", md: "12px" },
              lineHeight: 1,
            }}
          >
            PUNTOS ACUMULABLES
          </Typography>
          <Typography
            sx={{
              fontFamily: "fontFamily.terciary",
              color: "success.main",
              fontSize: { xs: "10px", md: "15px" },
              lineHeight: 0.9,
              whiteSpace: "nowrap",
            }}
          >
            +{calculatedProductTotals.totalRewardPoints} pts
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 1, borderColor: "transparent" }} />
      {calculatedProductTotals.totalRedeemPoints > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.secondary",
              fontSize: { xs: "10px", md: "12px" },
              lineHeight: 1,
            }}
          >
            PUNTOS CANJEADOS
          </Typography>
          <Typography
            sx={{
              fontFamily: "fontFamily.terciary",
              color: "error.main",
              fontSize: { xs: "10px", md: "15px" },
              lineHeight: 0.9,
              whiteSpace: "nowrap",
            }}
          >
            -{calculatedProductTotals.totalRedeemPoints} pts
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
