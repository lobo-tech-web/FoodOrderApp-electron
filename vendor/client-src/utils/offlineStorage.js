const OFFLINE_PREFIX = "lobotech:offline";

const FORCED_MODE_KEY = `${OFFLINE_PREFIX}:forced`;
const BACKEND_STATUS_KEY = `${OFFLINE_PREFIX}:backendReachable`;
const RESTAURANT_CACHE_PREFIX = `${OFFLINE_PREFIX}:restaurant`;
const ORDERS_KEY = `${OFFLINE_PREFIX}:orders`;

export const OFFLINE_STATUS_EVENT = "lobotech-offline-status-change";

const isBrowser = () => typeof window !== "undefined";

const dispatchOfflineStatusChange = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(
    new CustomEvent(OFFLINE_STATUS_EVENT, {
      detail: getOfflineStatusSnapshot(),
    }),
  );
};

const safeReadJson = (key, fallback) => {
  if (!isBrowser()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const safeWriteJson = (key, value) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("No se pudo guardar informacion offline:", error);
  }
};

const getRestaurantCacheKey = (restaurantId) =>
  `${RESTAURANT_CACHE_PREFIX}:${restaurantId || "unknown"}`;

const normalizeDatePart = (value) => String(value || "").padStart(2, "0");

const getCurrentOrderDate = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value]),
  );

  return {
    day: parts.day,
    month: parts.month,
    year: parts.year,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
};

export const getOrderDateKey = (orderDate = {}) => {
  const rawDay = String(orderDate.day || "").trim();
  const rawMonth = String(orderDate.month || "").trim();
  const year = String(orderDate.year || "").trim();

  if (!rawDay || !rawMonth || !year) return "";

  const day = normalizeDatePart(rawDay);
  const month = normalizeDatePart(rawMonth);

  return `${year}-${month}-${day}`;
};

export const isNetworkError = (error) => {
  if (!error) return false;
  if (!isBrowser() || !window.navigator.onLine) return true;
  if (error.response) return false;

  const message = String(error.message || error).toLowerCase();
  return [
    "network error",
    "failed to fetch",
    "timeout",
    "network",
    "conectarse",
    "servidor",
    "err_network",
    "econn",
  ].some((fragment) => message.includes(fragment));
};

export const isForcedOfflineMode = () => {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(FORCED_MODE_KEY) === "true";
};

export const setForcedOfflineMode = (enabled) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(FORCED_MODE_KEY, enabled ? "true" : "false");
  dispatchOfflineStatusChange();
};

export const setBackendReachable = (reachable) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(BACKEND_STATUS_KEY, reachable ? "true" : "false");
  dispatchOfflineStatusChange();
};

export const isBackendReachable = () => {
  if (!isBrowser()) return true;
  return window.localStorage.getItem(BACKEND_STATUS_KEY) !== "false";
};

export const cacheRestaurantData = (restaurantId, patch = {}) => {
  if (!restaurantId) return;

  const key = getRestaurantCacheKey(restaurantId);
  const current = safeReadJson(key, {});

  safeWriteJson(key, {
    ...current,
    ...patch,
    restaurantId,
    updatedAt: new Date().toISOString(),
  });
};

export const getCachedRestaurantData = (restaurantId) => {
  if (!restaurantId) return {};
  return safeReadJson(getRestaurantCacheKey(restaurantId), {});
};

export const cacheOrdersForDate = (
  restaurantId,
  dateKey,
  orders = [],
) => {
  if (!restaurantId || !dateKey) return;

  const cached = getCachedRestaurantData(restaurantId);
  cacheRestaurantData(restaurantId, {
    ordersByDate: {
      ...(cached.ordersByDate || {}),
      [dateKey]: orders,
    },
  });
};

export const getCachedOrdersForDate = (restaurantId, dateKey) => {
  const cached = getCachedRestaurantData(restaurantId);

  if (!dateKey) {
    return Object.values(cached.ordersByDate || {}).flat();
  }

  return cached.ordersByDate?.[dateKey] || [];
};

export const getOfflineOrders = (restaurantId = null) => {
  const orders = safeReadJson(ORDERS_KEY, []);
  if (!restaurantId) return orders;

  return orders.filter(
    (order) => String(order.restaurantId) === String(restaurantId),
  );
};

const saveOfflineOrders = (orders) => {
  safeWriteJson(ORDERS_KEY, orders);
  dispatchOfflineStatusChange();
};

const getNextLocalOrderIndex = (restaurantId, dateKey) => {
  const cachedServerOrders = getCachedOrdersForDate(restaurantId, dateKey);
  const offlineOrders = getOfflineOrders(restaurantId).filter(
    (order) => getOrderDateKey(order.orderDate) === dateKey,
  );

  const maxLocalIndex = offlineOrders.reduce(
    (max, order) => Math.max(max, Number(order.orderIndex || 0)),
    0,
  );

  return Math.max(cachedServerOrders.length, maxLocalIndex) + 1;
};

export const createOfflineOrder = (orderData = {}) => {
  const orderDate = orderData.orderDate?.day
    ? orderData.orderDate
    : getCurrentOrderDate();
  const dateKey = getOrderDateKey(orderDate);
  const restaurantId = orderData.restaurantId || orderData.userId || "local";
  const offlineId = `offline-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const orderIndex = getNextLocalOrderIndex(restaurantId, dateKey);
  const now = new Date().toISOString();
  const offlineOrder = {
    ...orderData,
    id: offlineId,
    clientOfflineId: offlineId,
    clientOfflineOrderNumber: orderIndex,
    orderDate,
    orderIndex,
    orderNumber: orderIndex,
    number: orderIndex,
    restaurantId,
    offlineOrder: true,
    offlineSyncStatus: "pending",
    offlineCreatedAt: now,
    offlineUpdatedAt: now,
  };

  saveOfflineOrders([offlineOrder, ...getOfflineOrders()]);
  return offlineOrder;
};

export const updateOfflineOrder = (orderId, patch = {}) => {
  let updatedOrder = null;
  const orders = getOfflineOrders().map((order) => {
    const matches =
      order.id === orderId ||
      order.clientOfflineId === orderId ||
      order.serverOrderId === orderId;

    if (!matches) return order;

    updatedOrder = {
      ...order,
      ...patch,
      offlineUpdatedAt: new Date().toISOString(),
    };
    return updatedOrder;
  });

  if (updatedOrder) saveOfflineOrders(orders);
  return updatedOrder;
};

export const markOfflineOrderSyncing = (orderId) =>
  updateOfflineOrder(orderId, { offlineSyncStatus: "syncing" });

export const markOfflineOrderSynced = (orderId, serverOrder = {}) =>
  updateOfflineOrder(orderId, {
    ...serverOrder,
    id: serverOrder.id || orderId,
    serverOrderId: serverOrder.id,
    offlineOrder: false,
    offlineSyncStatus: "synced",
    offlineSyncedAt: new Date().toISOString(),
  });

export const markOfflineOrderSyncError = (orderId, error) =>
  updateOfflineOrder(orderId, {
    offlineSyncStatus: "error",
    offlineSyncError: error?.message || String(error || "Error de sincronizacion"),
  });

export const getPendingOfflineOrders = () =>
  getOfflineOrders().filter((order) =>
    ["pending", "error"].includes(order.offlineSyncStatus),
  );

export const getPendingOfflineOrdersCount = () =>
  getPendingOfflineOrders().length;

const orderMatchesDateFilter = (orderDate = {}, dateFilter = {}) => {
  const day = String(dateFilter.day || "").trim();
  const month = String(dateFilter.month || "").trim();
  const year = String(dateFilter.year || "").trim();

  if (day && normalizeDatePart(orderDate.day) !== normalizeDatePart(day)) {
    return false;
  }

  if (month && normalizeDatePart(orderDate.month) !== normalizeDatePart(month)) {
    return false;
  }

  if (year && String(orderDate.year || "") !== year) {
    return false;
  }

  return true;
};

export const mergeOrdersWithOffline = (
  serverOrders = [],
  restaurantId,
  dateKey = "",
  dateFilter = null,
) => {
  const serverIds = new Set(serverOrders.map((order) => order.id));
  const offlineOrders = getOfflineOrders(restaurantId).filter((order) => {
    const matchesDate = dateFilter
      ? orderMatchesDateFilter(order.orderDate, dateFilter)
      : !dateKey || getOrderDateKey(order.orderDate) === dateKey;
    const isAlreadyOnServer =
      order.serverOrderId && serverIds.has(order.serverOrderId);

    return matchesDate && !isAlreadyOnServer;
  });

  return [...offlineOrders, ...serverOrders].sort((a, b) => {
    const first = new Date(
      a.offlineCreatedAt || a.createdAt || a.updatedAt || 0,
    ).getTime();
    const second = new Date(
      b.offlineCreatedAt || b.createdAt || b.updatedAt || 0,
    ).getTime();

    return second - first;
  });
};

export const getOfflineStatusSnapshot = () => ({
  forcedOffline: isForcedOfflineMode(),
  browserOnline: isBrowser() ? window.navigator.onLine : true,
  backendReachable: isBackendReachable(),
  pendingOrders: getPendingOfflineOrdersCount(),
});

export const subscribeOfflineStatus = (listener) => {
  if (!isBrowser()) return () => { };

  const handleChange = () => listener(getOfflineStatusSnapshot());
  window.addEventListener(OFFLINE_STATUS_EVENT, handleChange);
  window.addEventListener("online", handleChange);
  window.addEventListener("offline", handleChange);

  return () => {
    window.removeEventListener(OFFLINE_STATUS_EVENT, handleChange);
    window.removeEventListener("online", handleChange);
    window.removeEventListener("offline", handleChange);
  };
};
