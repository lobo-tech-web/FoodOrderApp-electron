import { Box, Paper, Divider } from "@mui/material";

// ---- SECTIONS ----
import { PaymentSection } from "./sections/PaymentSection.jsx";
import { DeliverySection } from "./sections/DeliverySection.jsx";
import { DiscountSection } from "./sections/DiscountSection.jsx";
import { TaxSection } from "./sections/TaxSection.jsx";
import { CartProductSection } from "./sections/CartProductSection.jsx";
// ------------------

// ---- STYLES ----
import { sectionCardStyle } from "../styles/modalCreateOrder.styles.js";
// ----------------

export const OrderDetailsTab = ({
  order,
  setOrder,
  handleInputChange,
  isDiscount,
  handleDiscountChange,
  calculatedDiscount,
  addServiceTax,
  setAddServiceTax,
  handleQuantityChange,
  handleRemoveProduct,
  handleEditProduct,
  setShowProductSelector,
}) => {
  return (
    <Box>
      <Paper elevation={0} sx={sectionCardStyle}>
        <PaymentSection order={order} setOrder={setOrder} />

        <Divider sx={{ my: 2.2, borderColor: "text.secondary" }} />

        <DeliverySection
          order={order}
          setOrder={setOrder}
          handleInputChange={handleInputChange}
        />

        <Divider sx={{ my: 2.2, borderColor: "text.secondary" }} />

        <DiscountSection
          order={order}
          isDiscount={isDiscount}
          handleInputChange={handleInputChange}
          handleDiscountChange={handleDiscountChange}
          calculatedDiscount={calculatedDiscount}
        />

        <TaxSection
          addServiceTax={addServiceTax}
          setAddServiceTax={setAddServiceTax}
        />
      </Paper>

      <CartProductSection
        order={order}
        handleQuantityChange={handleQuantityChange}
        handleRemoveProduct={handleRemoveProduct}
        handleEditProduct={handleEditProduct}
        setShowProductSelector={setShowProductSelector}
      />
    </Box>
  );
};
