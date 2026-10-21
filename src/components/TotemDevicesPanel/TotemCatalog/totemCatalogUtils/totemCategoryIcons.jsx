// ---- Material UI ----
import {
  CakeOutlined,
  LocalCafeOutlined,
  LocalBarOutlined,
  LocalDrinkOutlined,
  LunchDiningOutlined,
  LocalPizzaOutlined,
  RestaurantOutlined,
  Stars,
  SpaOutlined,
} from "@mui/icons-material";
// ---------------------

// Personalizá primero por ID o nombre exacto. Ejemplo: "Cafetería": LocalCafeOutlined.
export const CATEGORY_ICON_OVERRIDES = {};

// La primera regla que coincida gana. Se ignoran mayúsculas y acentos.
export const CATEGORY_ICON_RULES = [
  { keywords: ["canje", "puntos", "premio"], icon: Stars },
  { keywords: ["cafe", "coffee", "infusion"], icon: LocalCafeOutlined },
  {
    keywords: ["smoothie", "licuado", "jugo", "bebida", "limonada"],
    icon: LocalDrinkOutlined,
  },
  { keywords: ["cerveza", "vino", "coctel", "trago"], icon: LocalBarOutlined },
  {
    keywords: ["dulce", "postre", "torta", "pasteler", "medialuna"],
    icon: CakeOutlined,
  },
  { keywords: ["pizza"], icon: LocalPizzaOutlined },
  {
    keywords: ["salado", "burger", "hamburgues", "sandwich"],
    icon: LunchDiningOutlined,
  },
  { keywords: ["ensalada", "vegano", "vegetar"], icon: SpaOutlined },
];

export const getTotemCategoryIcon = (category) => {
  const override =
    CATEGORY_ICON_OVERRIDES[category.id] ||
    CATEGORY_ICON_OVERRIDES[category.name];
  if (override) return override;
  const name = String(category.name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return (
    CATEGORY_ICON_RULES.find(({ keywords }) =>
      keywords.some((keyword) => name.includes(keyword)),
    )?.icon || RestaurantOutlined
  );
};
