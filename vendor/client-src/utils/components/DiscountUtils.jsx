// ---- Icons ----
import {
  Cancel as CancelIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
// ---------------

export const discountMethods = [
  {
    value: 'SIN DESCUENTO',
    icon: <CancelIcon color="secondary" />,
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
