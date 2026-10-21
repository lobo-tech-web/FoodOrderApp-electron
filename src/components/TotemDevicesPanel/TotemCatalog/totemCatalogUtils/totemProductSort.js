export const TOTEM_SORT_OPTIONS = [
  { value: "name_asc", label: "Nombre: A a Z" },
  { value: "name_desc", label: "Nombre: Z a A" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "points_asc", label: "Puntos: menor a mayor" },
  { value: "points_desc", label: "Puntos: mayor a menor" },
];

const byName = (a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es-AR", { sensitivity: "base", numeric: true });

export const sortTotemProducts = (products, order) => [...products].sort((a, b) => {
  const direction = order.endsWith("_desc") ? -1 : 1;

  if (order.startsWith("name_")) return direction * byName(a, b);

  const aPoints = Number(a.redeemPoints || 0);
  const bPoints = Number(b.redeemPoints || 0);

  // Evitamos mezclar pesos y puntos como si fueran la misma unidad.
  const pointsOrder = order.startsWith("points_");
  const group = pointsOrder
    ? Number(bPoints > 0) - Number(aPoints > 0)
    : Number(aPoints > 0) - Number(bPoints > 0);

  if (group) return group;

  const difference = pointsOrder
    ? aPoints - bPoints
    : Number(a.displayPrice || 0) - Number(b.displayPrice || 0);

  return direction * difference || byName(a, b);
});
