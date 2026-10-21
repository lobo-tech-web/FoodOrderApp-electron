import { RestaurantRounded, ShoppingBagOutlined } from "@mui/icons-material";

// ---- Assets ----
import dineInImage from "@/assets/main/totem/eat-in.png";
import takeawayImage from "@/assets/main/totem/take-away.png";
// ----------------

export const TOTEM_ORDER_TYPES = [
  {
    value: "CONSUMIR EN LOCAL",
    title: "CONSUMIR EN EL LOCAL",
    titleKey: "dineIn",
    image: dineInImage,
    icon: <RestaurantRounded />,
  },
  {
    value: "ESPERA EN LOCAL",
    title: "PARA LLEVAR",
    titleKey: "takeaway",
    image: takeawayImage,
    icon: <ShoppingBagOutlined />,
  },
];

export const TRANSLATIONS = {
  es: {
    greeting: "¡Hola!",
    subtitle: "Elegí dónde disfrutar tu pedido",
    dineIn: "Consumir en el local",
    takeaway: "Para llevar",
    payment: "Exclusivo pago electrónico",
    language: "Español",
    selectLanguage: "Seleccionar idioma",
    accessibility: "Texto grande",
  },
  en: {
    greeting: "Hello!",
    subtitle: "Where would you like to enjoy your order?",
    dineIn: "Eat here",
    takeaway: "Take away",
    payment: "Electronic payments only",
    language: "English",
    selectLanguage: "Select language",
    accessibility: "Large text",
  },
};
