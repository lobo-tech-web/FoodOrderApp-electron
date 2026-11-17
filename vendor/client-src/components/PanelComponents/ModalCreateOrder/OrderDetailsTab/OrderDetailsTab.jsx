// ---- Material UI ----
import { Box, Paper, InputAdornment, TextField } from "@mui/material";
// Icons
import {
  Cancel,
  AttachMoney,
  Comment,
  LocationOn,
  AccountBalanceWallet,
  Percent,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { FieldLabel } from "../shared/FieldLabel.jsx";
import { SectionHeading } from "../shared/SectionHeading.jsx";
// ----------------

// ---- Sections ----
import { DeliverySection } from "./sections/DeliverySection.jsx";
import { DiscountSection } from "./sections/DiscountSection.jsx";
import { PaymentSection } from "./sections/PaymentSection.jsx";
// ------------------

// ---- Styles ----
import {
  compactFieldStyles,
  sectionCardStyle,
} from "../styles/modalCreateOrder.styles.js";
// ----------------

export const OrderDetailsTab = ({
  order,
  setOrder,
  handleInputChange,
  isDiscount,
  handleDiscountChange,
  availablePaymentMethods = [],
}) => {
  const isPercentageDiscount = isDiscount === "PORCENTAJE";
  const hasDiscountInput = isPercentageDiscount || isDiscount === "MONTO";
  const hasDeliveryCost = order.orderType === "DELIVERY";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flex: "1 0 auto",
      }}
    >
      <Paper elevation={0} sx={{ ...sectionCardStyle, mb: 0, flexShrink: 0 }}>
        <DeliverySection order={order} setOrder={setOrder} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "minmax(0, 2fr) minmax(0, 1fr)",
            },
            gap: 1,
            mt: 1,
          }}
        >
          <Box>
            <FieldLabel icon={<LocationOn fontSize="small" />}>
              DIRECCION DE ENTREGA
            </FieldLabel>

            <TextField
              size="small"
              fullWidth
              disabled={!hasDeliveryCost}
              name="deliveryAddress"
              placeholder="Ingresa la direccion completa de entrega"
              value={order.deliveryAddress}
              onChange={handleInputChange}
              sx={compactFieldStyles}
            />
          </Box>

          <Box>
            <FieldLabel icon={<AttachMoney fontSize="small" />}>
              COSTO DE DELIVERY
            </FieldLabel>

            <TextField
              size="small"
              fullWidth
              disabled={!hasDeliveryCost}
              name="deliverycost"
              value={order.deliverycost}
              onChange={handleInputChange}
              sx={compactFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                inputProps: { min: 0, step: 0.01 },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 1 }}>
          <FieldLabel icon={<Comment fontSize="small" />}>
            COMENTARIOS PARA EL PEDIDO
          </FieldLabel>

          <TextField
            size="small"
            fullWidth
            multiline
            minRows={1}
            maxRows={2}
            placeholder="Agregar comentarios especiales para el pedido..."
            name="comentary"
            value={order.comentary}
            onChange={handleInputChange}
            sx={compactFieldStyles}
          />
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ ...sectionCardStyle, mb: 0, flex: 1 }}>
        <SectionHeading
          step={3}
          icon={<AccountBalanceWallet />}
          title="PAGO Y DESCUENTO"
          description={"seleccioná el tipo de pago y los descuentos a aplicar"}
        />

        <PaymentSection
          order={order}
          setOrder={setOrder}
          availablePaymentMethods={availablePaymentMethods}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            alignItems: "start",
            gap: 1,
            mt: 1,
          }}
        >
          <DiscountSection
            isDiscount={isDiscount}
            handleDiscountChange={handleDiscountChange}
          />

          <Box sx={{ width: "100%", maxWidth: 240 }}>
            <FieldLabel
              icon={
                !hasDiscountInput ? (
                  <Cancel fontSize="small" />
                ) : isPercentageDiscount ? (
                  <Percent fontSize="small" />
                ) : (
                  <AttachMoney fontSize="small" />
                )
              }
            >
              {!hasDiscountInput
                ? "SIN DESCUENTO"
                : isPercentageDiscount
                  ? "DESCUENTO EN PORCENTAJE"
                  : "DESCUENTO EN MONTO"}
            </FieldLabel>

            <TextField
              size="small"
              fullWidth
              type="number"
              name={isPercentageDiscount ? "discount" : "discountamount"}
              value={
                isPercentageDiscount ? order.discount : order.discountamount
              }
              disabled={!hasDiscountInput}
              onChange={handleInputChange}
              sx={compactFieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {isPercentageDiscount ? "%" : "$"}
                  </InputAdornment>
                ),
                inputProps: {
                  min: 0,
                  max: isPercentageDiscount ? 100 : undefined,
                  step: 0.01,
                },
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
