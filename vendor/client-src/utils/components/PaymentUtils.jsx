// ICONS
import {
  Handshake as HandshakeIcon,
  Payments as PaymentsIcon,
  AccountBalance as AccountBalanceIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
// ----------------------

export const paymentMethods = [
  {
    value: 'MERCADO PAGO',
    icon: <HandshakeIcon />,
  },
  {
    value: 'EFECTIVO',
    icon: <PaymentsIcon />,
  },
  {
    value: 'TRANSFERENCIA',
    icon: <AccountBalanceIcon />,
  },
  {
    value: 'SIN ESPECIFICAR',
    icon: <HelpOutlineIcon />,
  },
];
