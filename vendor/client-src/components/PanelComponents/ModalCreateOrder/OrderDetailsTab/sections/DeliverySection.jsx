// ---- Material UI ----
import { Box } from "@mui/material";
// ICONS
import {
  Storefront as StorefrontIcon,
  Hail as HailIcon,
  Restaurant as RestaurantIcon,
  DeliveryDining as DeliveryDiningIcon,
} from "@mui/icons-material";
// ---------------------

// ---- SHARED ----
import { SectionHeading } from "../../shared/SectionHeading.jsx";
import { OptionTile } from "../../shared/OptionTile.jsx";
// ----------------

// ---- STYLES ----
import { optionGroupStyle } from "../../styles/modalCreateOrder.styles.js";
// ----------------

export const DeliverySection = ({ order, setOrder }) => {
  // Tipos de pedido
  const orderTypeOptions = [
    {
      value: "RETIRO EN LOCAL",
      icon: <StorefrontIcon sx={{ color: "#ff9800" }} />,
    },
    {
      value: "ESPERA EN LOCAL",
      icon: <HailIcon sx={{ color: "#2196f3" }} />,
    },
    {
      value: "DELIVERY",
      icon: <DeliveryDiningIcon sx={{ color: "#9c27b0" }} />,
    },
    {
      value: "CONSUMIR EN LOCAL",
      icon: <RestaurantIcon sx={{ color: "#4caf50" }} />,
    },
  ];

  return (
    <Box>
      <SectionHeading
        step={2}
        icon={<DeliveryDiningIcon />}
        title="ENTREGA"
        description={"seleccioná el tipo de entrega del pedido"}
      />

      <Box sx={optionGroupStyle}>
        {orderTypeOptions.map((option) => (
          <OptionTile
            key={option.value}
            active={order.orderType === option.value}
            icon={option.icon}
            label={option.value}
            onClick={() =>
              setOrder((prev) => ({
                ...prev,
                orderType: option.value,
                deliverycost:
                  option.value === "DELIVERY" ? prev.deliverycost : 0,
              }))
            }
          />
        ))}
      </Box>
    </Box>
  );
};
