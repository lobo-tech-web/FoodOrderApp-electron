import {
  AccountBalance as TransferIcon,
  CreditCard as CardIcon,
  LocalDining as DineInIcon,
  Payments as CashIcon,
  PointOfSale as MercadoPagoIcon,
  Storefront as TakeAwayIcon,
} from "@mui/icons-material";

export const ORDER_TYPES = [
  {
    value: "RETIRO EN LOCAL",
    title: "Para llevar",
    description: "Retira el pedido en el mostrador",
    icon: <TakeAwayIcon />,
  },
  {
    value: "CONSUMIR EN LOCAL",
    title: "Consumir en el local",
    description: "El pedido se entrega para comer aqui",
    icon: <DineInIcon />,
  },
];

export const INITIAL_CHECKOUT = {
  paymentMethod: "",
  clientName: "",
  userNumber: "",
};

const PAYMENT_METHOD_ICONS = {
  EFECTIVO: <CashIcon />,
  "MERCADO PAGO": <MercadoPagoIcon />,
  TRANSFERENCIA: <TransferIcon />,
};

const formatPaymentMethod = (value) =>
  value
    .toLocaleLowerCase("es-AR")
    .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase("es-AR"));

export const getPaymentMethods = (paymentMethods) => {
  if (!Array.isArray(paymentMethods)) return [];

  const normalizedMethods = paymentMethods
    .filter((method) => typeof method === "string" && method.trim())
    .map((method) => method.trim().toLocaleUpperCase("es-AR"));

  return [...new Set(normalizedMethods)].map((value) => ({
    value,
    label: formatPaymentMethod(value),
    icon: PAYMENT_METHOD_ICONS[value] || <CardIcon />,
  }));
};
