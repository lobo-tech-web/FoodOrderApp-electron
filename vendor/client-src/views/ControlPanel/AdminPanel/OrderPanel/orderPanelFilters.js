// ---- Utils ----
import { getDateNowDayjs } from "@/utils/clientWorking.js";
// ---------------

export const createOrderPanelFilters = (view) => {
  const { day, month, year } = getDateNowDayjs();

  return {
    view, period: view === 1 ? "day" : view === 11 ? "month" : "all",
    date: `${year}-${month}-${day}`, mode: "date", searchInput: "", searchTerm: "",
    status: "TODOS", orderType: "TODOS",
  };
};

export const getOrderPanelQuery = (filters, restaurantId) => ({
  restaurantId, mode: filters.mode,
  ...(filters.mode === "search"
    ? { searchTerm: filters.searchTerm }
    : { period: filters.period, date: filters.period === "all" ? null : filters.date }),
});

export const getOrderPanelTitle = (filters) => {
  if (filters.mode === "search") {
    return `BÚSQUEDA EN TODO EL HISTORIAL: ${filters.searchTerm}`;
  }

  if (filters.period === "all") {
    return "HISTORIAL DE PEDIDOS";
  }

  const [year, month, day] = filters.date.split("-");
  return filters.period === "month" ? `PEDIDOS DE ${month}/${year}` : `PEDIDOS DEL ${day}/${month}/${year}`;
};
