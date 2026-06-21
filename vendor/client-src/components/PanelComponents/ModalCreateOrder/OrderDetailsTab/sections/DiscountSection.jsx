import { Box, TextField, InputAdornment } from '@mui/material';
// ICONS
import {
  Cancel as CancelIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';

// ---- SHARED ----
import { SectionHeading } from '../../shared/SectionHeading.jsx';
import { OptionTile } from '../../shared/OptionTile.jsx';
import { FieldLabel } from '../../shared/FieldLabel.jsx';

// ---- UTILS ----
import { formatCurrency } from '@/utils/orderCalculations.js';

// ---- STYLES ----
import { fieldStyles } from '../../styles/modalCreateOrder.styles.js';

export const DiscountSection = ({
  order,
  isDiscount,
  handleInputChange,
  handleDiscountChange,
  calculatedDiscount,
}) => {
  // TIPOS DE DESCUENTO
  const discountMethods = [
    {
      value: 'SIN DESCUENTO',
      icon: <CancelIcon />,
    },
    {
      value: 'PORCENTAJE',
      icon: <PercentIcon color="primary" />,
    },
    {
      value: 'MONTO',
      icon: <MoneyIcon color="primary" />,
    },
  ];

  const isPercentageDiscount = isDiscount === 'PORCENTAJE';
  const isAmountDiscount = isDiscount === 'MONTO';
  const hasDiscountInput = isPercentageDiscount || isAmountDiscount;
  return (
    <Box>
      <SectionHeading icon={<LocalOfferIcon />} title="DESCUENTO" />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
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

      {hasDiscountInput && (
        <Box sx={{ mt: 2, maxWidth: 260 }}>
          <FieldLabel>
            {isPercentageDiscount
              ? 'DESCUENTO DEL PEDIDO (%)'
              : 'DESCUENTO DEL PEDIDO ($)'}
          </FieldLabel>

          <TextField
            type="number"
            name={isPercentageDiscount ? 'discount' : 'discountamount'}
            value={isPercentageDiscount ? order.discount : order.discountamount}
            onChange={handleInputChange}
            sx={fieldStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isPercentageDiscount ? (
                    <PercentIcon fontSize="small" />
                  ) : (
                    <MoneyIcon fontSize="small" />
                  )}
                </InputAdornment>
              ),
              inputProps: {
                min: 0,
                max: isPercentageDiscount ? 100 : undefined,
                step: 0.01,
              },
            }}
            helperText={
              calculatedDiscount.discountamount > 0
                ? 'Descuento aplicado: ' +
                  formatCurrency(calculatedDiscount.discountamount)
                : isPercentageDiscount
                  ? '(0-100%)'
                  : ''
            }
          />
        </Box>
      )}
    </Box>
  );
};
