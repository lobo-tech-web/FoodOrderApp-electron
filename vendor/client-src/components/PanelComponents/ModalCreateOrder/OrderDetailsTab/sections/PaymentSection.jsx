// ---- MATERIAL UI ----
import { Box } from "@mui/material";
// ICONS
import { AccountBalanceWallet as WalletIcon } from "@mui/icons-material";
// ----------------------

// ---- SHARED ----
import { OptionTile } from "../../shared/OptionTile.jsx";
import { SectionHeading } from "../../shared/SectionHeading.jsx";
// ----------------

// ---- Utils ----
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
// ---------------

export const PaymentSection = ({ order, setOrder }) => {
  return (
    <Box>
      <SectionHeading icon={<WalletIcon />} title="METODO DE PAGO" />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {paymentMethods.map((method) => (
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
