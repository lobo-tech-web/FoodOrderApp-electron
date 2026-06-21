import { Box, TextField, InputAdornment } from '@mui/material';
// ICONS
import {
  Storefront as StorefrontIcon,
  Hail as HailIcon,
  Restaurant as RestaurantIcon,
  DeliveryDining as DeliveryDiningIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

// ---- SHARED ----
import { SectionHeading } from '../../shared/SectionHeading.jsx';
import { OptionTile } from '../../shared/OptionTile.jsx';
import { FieldLabel } from '../../shared/FieldLabel.jsx';
// ----------------

// ---- STYLES ----
import { fieldStyles } from '../../styles/modalCreateOrder.styles.js';
// ----------------

export const DeliverySection = ({ order, setOrder, handleInputChange }) => {
  // Tipos de pedido
  const orderTypeOptions = [
    {
      value: 'RETIRO EN LOCAL',
      icon: <StorefrontIcon sx={{ color: '#ff9800' }} />,
    },
    {
      value: 'ESPERA EN LOCAL',
      icon: <HailIcon sx={{ color: '#2196f3' }} />,
    },
    {
      value: 'DELIVERY',
      icon: <DeliveryDiningIcon sx={{ color: '#9c27b0' }} />,
    },
    {
      value: 'CONSUMIR EN LOCAL',
      icon: <RestaurantIcon sx={{ color: '#4caf50' }} />,
    },
  ];
  return (
    <Box sx={{ mt: 3 }}>
      <SectionHeading icon={<DeliveryDiningIcon />} title="TIPO DE ENTREGA" />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
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
              }))
            }
          />
        ))}
      </Box>

      {order.orderType === 'DELIVERY' && (
        <Box sx={{ mt: 2, maxWidth: 220 }}>
          <FieldLabel icon={<MoneyIcon fontSize="small" />}>
            COSTO DE DELIVERY
          </FieldLabel>
          <TextField
            type="text"
            name="deliverycost"
            value={order.deliverycost}
            onChange={handleInputChange}
            sx={fieldStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: { min: 0, step: 0.01 },
            }}
          />
        </Box>
      )}
    </Box>
  );
};
