// ---- Icons ----
import {
  Storefront as StorefrontIcon,
  Hail as HailIcon,
  Restaurant as RestaurantIcon,
  TwoWheeler as TwoWheelerIcon,
} from '@mui/icons-material';
// ---------------

export const orderTypeOptions = [
  {
    value: 'RETIRO EN LOCAL',
    icon: <StorefrontIcon sx={{ color: '#ff9800' }} />,
  },
  {
    value: 'ESPERA EN LOCAL',
    icon: <HailIcon sx={{ color: '#9c27b0' }} />,
  },
  {
    value: 'DELIVERY',
    icon: <TwoWheelerIcon sx={{ color: '#2196f3' }} />,
  },
  {
    value: 'CONSUMIR EN LOCAL',
    icon: <RestaurantIcon sx={{ color: '#4caf50' }} />,
  },
];
