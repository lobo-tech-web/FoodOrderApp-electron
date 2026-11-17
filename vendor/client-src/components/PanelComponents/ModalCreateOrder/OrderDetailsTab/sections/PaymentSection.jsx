// ---- MATERIAL UI ----
import { Box } from "@mui/material";
// ICONS
import { AccountBalanceWallet as WalletIcon } from "@mui/icons-material";
// ----------------------

// ---- SHARED ----
import { OptionTile } from "../../shared/OptionTile.jsx";
import { FieldLabel } from "../../shared/FieldLabel.jsx";
// ----------------

// ---- Styles ----
import { optionGroupStyle } from "../../styles/modalCreateOrder.styles.js";
// ----------------

export const PaymentSection = ({
  order,
  setOrder,
  availablePaymentMethods = [],
}) => {
  return (
    <Box>
      <FieldLabel icon={<WalletIcon />}>METODO DE PAGO</FieldLabel>

      <Box sx={optionGroupStyle}>
        {availablePaymentMethods.map((method) => (
          <OptionTile
            key={method.value}
            active={order.paymentMethod === method.value}
            icon={method.icon}
            label={method.value}
            onClick={() =>
              setOrder((prev) => ({
                ...prev,
                paymentMethod: method.value,
              }))
            }
          />
        ))}
      </Box>
    </Box>
  );
};
