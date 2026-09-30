// ICONS
import {
  Handshake as HandshakeIcon,
  Payments as PaymentsIcon,
  AccountBalance as AccountBalanceIcon,
  HelpOutline as HelpOutlineIcon,
  CreditCard as CreditCardIcon,
  WifiProtectedSetup as CombinedIcon,
} from "@mui/icons-material";
// ----------------------

export const paymentMethods = [
  {
    value: "MERCADO PAGO",
    icon: <HandshakeIcon />,
  },
  {
    value: "EFECTIVO",
    icon: <PaymentsIcon />,
  },
  {
    value: "TRANSFERENCIA",
    icon: <AccountBalanceIcon />,
  },
  {
    value: "SIN ESPECIFICAR",
    icon: <HelpOutlineIcon />,
  },
  {
    value: "TARJETA",
    icon: <CreditCardIcon />,
  },
  {
    value: "COMBINADO",
    icon: <CombinedIcon />,
  },
];

export const getConfiguredPaymentMethods = (user) => {
  const configured =
    user?.role === "staff"
      ? user?.restaurant?.paymentMethods
      : user?.paymentMethods;

  return Array.isArray(configured) ? configured : [];
};

export const getAvailablePaymentMethods = (user) => {
  const configured = getConfiguredPaymentMethods(user);

  return paymentMethods.filter((method) => configured.includes(method.value));
};
