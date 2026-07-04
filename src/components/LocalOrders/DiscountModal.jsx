import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  Cancel as CancelIcon,
  LocalOffer as DiscountIcon,
  Percent as PercentIcon,
} from "@mui/icons-material";

import { formatCurrency } from "@/utils/orderCalculations.js";
import { buttonStyle1 } from "../styles/buttonStyle.js";

const DISCOUNT_TYPES = [
  { value: "SIN DESCUENTO", label: "Sin descuento", icon: <CancelIcon /> },
  { value: "PORCENTAJE", label: "Porcentaje", icon: <PercentIcon /> },
  { value: "MONTO", label: "Monto", icon: <MoneyIcon /> },
];

export const DiscountModal = ({
  open,
  onClose,
  subtotal,
  discountConfig,
  discountAmount,
  totalAmount,
  onDiscountTypeChange,
  onDiscountValueChange,
}) => {
  const isPercentage = discountConfig.type === "PORCENTAJE";
  const isAmount = discountConfig.type === "MONTO";
  const hasInput = isPercentage || isAmount;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontFamily: "fontFamily.primary",
          color: "text.primary",
        }}
      >
        <DiscountIcon color="primary" />
        DESCUENTOS
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "background.default" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 1.2,
            mb: 2,
          }}
        >
          {DISCOUNT_TYPES.map((option) => {
            const active = discountConfig.type === option.value;

            return (
              <Button
                key={option.value}
                variant={active ? "contained" : "outlined"}
                startIcon={option.icon}
                onClick={() => onDiscountTypeChange(option.value)}
                sx={{
                  minHeight: 54,
                  fontFamily: "fontFamily.secondary",
                  borderRadius: 2,
                  color: active ? "text.terciary" : "text.primary",
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </Box>

        {hasInput && (
          <TextField
            fullWidth
            type="number"
            label={isPercentage ? "Descuento en porcentaje" : "Descuento en monto"}
            value={isPercentage ? discountConfig.discount : discountConfig.discountamount}
            onChange={(event) => onDiscountValueChange(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isPercentage ? <PercentIcon /> : <MoneyIcon />}
                </InputAdornment>
              ),
              inputProps: {
                min: 0,
                max: isPercentage ? 100 : undefined,
                step: 0.01,
              },
            }}
            helperText={
              isPercentage
                ? "Ingresa un valor entre 0 y 100."
                : "El descuento no puede superar el subtotal."
            }
            sx={{ mb: 2 }}
          />
        )}

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
              Subtotal
            </Typography>
            <Typography sx={{ fontFamily: "fontFamily.primary" }}>
              {formatCurrency(subtotal)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
              Descuento
            </Typography>
            <Typography sx={{ fontFamily: "fontFamily.primary", color: "error.main" }}>
              - {formatCurrency(discountAmount)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontFamily: "fontFamily.primary" }}>Total</Typography>
            <Typography sx={{ fontFamily: "fontFamily.primary", color: "primary.main" }}>
              {formatCurrency(totalAmount)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontFamily: "fontFamily.primary" }}>
          Cerrar
        </Button>
        <Button variant="contained" onClick={onClose} sx={buttonStyle1}>
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
