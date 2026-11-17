// ---- Material UI ----
import { Box } from "@mui/material";
// ICONS
import {
  Cancel as CancelIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as LocalOfferIcon,
} from "@mui/icons-material";
// ---------------------

// ---- SHARED ----
import { FieldLabel } from "../../shared/FieldLabel.jsx";
import { OptionTile } from "../../shared/OptionTile.jsx";

// ---- STYLES ----
import { optionGroupStyle } from "../../styles/modalCreateOrder.styles.js";
// ----------------

export const DiscountSection = ({ isDiscount, handleDiscountChange }) => {
  // TIPOS DE DESCUENTO
  const discountMethods = [
    {
      value: "SIN DESCUENTO",
      icon: <CancelIcon />,
    },
    {
      value: "PORCENTAJE",
      icon: <PercentIcon color="primary" />,
    },
    {
      value: "MONTO",
      icon: <MoneyIcon color="primary" />,
    },
  ];

  return (
    <Box>
      <FieldLabel icon={<LocalOfferIcon />}>DESCUENTO</FieldLabel>

      <Box sx={optionGroupStyle}>
        {discountMethods.map((type) => (
          <OptionTile
            key={type.value}
            active={isDiscount === type.value}
            icon={type.icon}
            label={type.value}
            onClick={() => handleDiscountChange(type.value)}
          />
        ))}
      </Box>
    </Box>
  );
};
