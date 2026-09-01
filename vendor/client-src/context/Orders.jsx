import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
} from "react";

// ---- ORDERS SERVICE ----
import {
  getAllOrdersServices,
  getByOrderIDServices,
  updateOrderServices,
  addNewOrderServices,
  syncOfflineOrdersServices,
  filterOrderByDateServices,
  filterOrdersByNamePhoneServices,
  getMonthlyOrdersServices,
  getAllMonthlyOrdersServices,
  getDailyOrdersStatsServices,
} from "@/services/orders.js";
// ------------------------

// ---- RIDERS SERVICE ----
import {
  getRidersByRestaurantServices,
  addNewRiderServices,
  updateRiderServices,
  addOrderToRiderServices,
  getDailyRidersStatsServices,
  getAllRidersStatsServices,
} from "@/services/riders.js";
// ------------------------

// ---- OFFLINE STORAGE ----
import {
  cacheOrdersForDate,
  createOfflineOrder,
  getCachedOrdersForDate,
  getOrderDateKey,
  getPendingOfflineOrders,
  isForcedOfflineMode,
  isNetworkError,
  markOfflineOrderSyncError,
  markOfflineOrderSynced,
  markOfflineOrderSyncing,
  mergeOrdersWithOffline,
  setBackendReachable,
  updateOfflineOrder,
} from "@/utils/offlineStorage.js";
// -------------------------

// ---- CREACIÓN DEL CONTEXTO ----
export const OrdersContext = createContext();

// ---- ESTADO INICIAL ----
const initialState = {
  allOrders: [],
  orders: [],
  orderStats: [],
  riders: [],
  ridersStats: {
    summary: {
      totalRiders: 0,
      totalTrips: 0,
      totalAmount: 0,
      totalDelivery: 0,
    },
    rows: [],
  },
};

// ---- TIPOS DE ACCION ----
const ACTION_TYPES = {
  GET_ALL_ORDERS: "GET_ALL_ORDERS",
  ADD_ORDER: "ADD_ORDER",
  UPDATE_ORDER: "UPDATE_ORDER",
  FILTER_BY_STATUS: "FILTER_BY_STATUS",
  FILTER_BY_DATE: "FILTER_BY_DATE",
  FILTER_ORDERS_BY_NAME_PHONE: "FILTER_ORDERS_BY_NAME_PHONE",
  GET_MONTHLY_ORDERS_STATS: "GET_MONTHLY_ORDERS_STATS",
  GET_DAILY_ORDERS_STATS: "GET_DAILY_ORDERS_STATS",
  GET_RIDERS_BY_RESTAURANT: "GET_RIDERS_BY_RESTAURANT",
  ADD_NEW_RIDER: "ADD_NEW_RIDER",
  UPDATE_RIDER: "UPDATE_RIDER",
  ADD_ORDER_TO_RIDER: "ADD_ORDER_TO_RIDER",
  GET_DAILY_RIDERS_STATS: "GET_DAILY_RIDERS_STATS",
  GET_ALL_RIDERS_STATS: "GET_ALL_RIDERS_STATS",
  REPLACE_ORDER: "REPLACE_ORDER",
};

let offlineSyncInProgress = false;

// REDUCER
const orderReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.GET_ALL_ORDERS: {
      return {
        ...state,
        allOrders: action.payload,
        orders: action.payload,
      };
    }

    case ACTION_TYPES.ADD_ORDER: {
      const updatedOrders = [...state.allOrders, action.payload];
      return {
        ...state,
        allOrders: updatedOrders,
      };
    }

    case ACTION_TYPES.UPDATE_ORDER: {
      const updatedOrder = action.payload.order;

      const updatedAllOrders = state.allOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      );
      const updatedOrders = state.orders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      );

      return {
        ...state,
        allOrders: updatedAllOrders,
        orders: updatedOrders,
      };
    }

    case ACTION_TYPES.REPLACE_ORDER: {
      const { previousId, order: replacementOrder } = action.payload;
      const replaceOrder = (currentOrder) =>
        currentOrder.id === previousId ? replacementOrder : currentOrder;

      return {
        ...state,
        allOrders: state.allOrders.map(replaceOrder),
        orders: state.orders.map(replaceOrder),
      };
    }

    case ACTION_TYPES.FILTER_BY_STATUS: {
      let filteredSource =
        action.payload === "all"
          ? state.allOrders
          : state.allOrders.filter((elem) => elem.status === action.payload);

      return {
        ...state,
        orders: filteredSource,
      };
    }

    case ACTION_TYPES.FILTER_BY_DATE: {
      return {
        ...state,
        orders: action.payload,
      };
    }

    case ACTION_TYPES.FILTER_ORDERS_BY_NAME_PHONE: {
      return {
        ...state,
        orders: action.payload,
      };
    }

    case ACTION_TYPES.GET_MONTHLY_ORDERS_STATS: {
      return {
        ...state,
        orderStats: action.payload,
      };
    }

    case ACTION_TYPES.GET_DAILY_ORDERS_STATS: {
      return {
        ...state,
        orderStats: action.payload,
      };
    }

    case ACTION_TYPES.GET_RIDERS_BY_RESTAURANT: {
      return {
        ...state,
        riders: action.payload,
      };
    }

    case ACTION_TYPES.ADD_NEW_RIDER: {
      const updatedRiders = [...state.riders, action.payload];
      return {
        ...state,
        riders: updatedRiders,
      };
    }

    case ACTION_TYPES.UPDATE_RIDER: {
      const updatedRider = action.payload;

      const updateAllRiders = state.riders.map((rider) =>
        rider.id === updatedRider.id ? updatedRider : rider,
      );

      return {
        ...state,
        riders: updateAllRiders,
      };
    }

    case ACTION_TYPES.ADD_ORDER_TO_RIDER: {
      const { rider, order } = action.payload;

      const updatedRiders = state.riders.map((r) =>
        r.id === rider.id ? rider : r,
      );
      const updatedOrders = state.orders.map((o) =>
        o.id === order.id ? { ...o, riderId: rider.id } : o,
      );
      const updatedAllOrders = state.allOrders.map((o) =>
        o.id === order.id ? { ...o, riderId: rider.id } : o,
      );

      return {
        ...state,
        riders: updatedRiders,
        orders: updatedOrders,
        allOrders: updatedAllOrders,
      };
    }

    case ACTION_TYPES.GET_DAILY_RIDERS_STATS: {
      return {
        ...state,
        ridersStats: action.payload,
      };
    }

    case ACTION_TYPES.GET_ALL_RIDERS_STATS: {
      return {
        ...state,
        ridersStats: action.payload,
      };
    }

    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [orderState, dispatch] = useReducer(orderReducer, initialState);

  const getAllOrders = useCallback(
    async (userId = null, restaurantId = null) => {
      try {
        if (isForcedOfflineMode()) {
          const offlineOrders = mergeOrdersWithOffline([], restaurantId);
          dispatch({
            type: ACTION_TYPES.GET_ALL_ORDERS,
            payload: offlineOrders,
          });
          return offlineOrders;
        }

        const response = await getAllOrdersServices(userId, restaurantId);
        setBackendReachable(true);
        const mergedOrders = mergeOrdersWithOffline(response, restaurantId);
        dispatch({
          type: ACTION_TYPES.GET_ALL_ORDERS,
          payload: mergedOrders,
        });
        return mergedOrders;
      } catch (error) {
        if (isNetworkError(error)) {
          setBackendReachable(false);
          const offlineOrders = mergeOrdersWithOffline([], restaurantId);
          dispatch({
            type: ACTION_TYPES.GET_ALL_ORDERS,
            payload: offlineOrders,
          });
          return offlineOrders;
        }

        throw error.response?.data?.message || error.message;
      }
    },
    [],
  );

  const getOrderById = useCallback(async (orderId) => {
    try {
      const response = await getByOrderIDServices(orderId);
      return response;
    } catch (error) {
      throw error.response?.data?.message || error.message || error;
    }
  }, []);

  const addOrder = useCallback(async (data) => {
    try {
      if (isForcedOfflineMode()) {
        const offlineOrder = createOfflineOrder(data);
        dispatch({
          type: ACTION_TYPES.ADD_ORDER,
          payload: offlineOrder,
        });
        return offlineOrder;
      }

      const response = await addNewOrderServices(data);
      setBackendReachable(true);
      const createdOrder = response?.order || response;
      dispatch({
        type: ACTION_TYPES.ADD_ORDER,
        payload: createdOrder,
      });
      return createdOrder;
    } catch (error) {
      if (isNetworkError(error)) {
        setBackendReachable(false);
        const offlineOrder = createOfflineOrder(data);
        dispatch({
          type: ACTION_TYPES.ADD_ORDER,
          payload: offlineOrder,
        });
        return offlineOrder;
      }

      throw error.response?.data?.message || error.message;
    }
  }, []);

  const updateOrder = useCallback(async (orderId, updateData) => {
    try {
      if (String(orderId).startsWith("offline-") || isForcedOfflineMode()) {
        const updatedOfflineOrder = updateOfflineOrder(orderId, updateData);

        if (updatedOfflineOrder) {
          dispatch({
            type: ACTION_TYPES.UPDATE_ORDER,
            payload: { order: updatedOfflineOrder },
          });
          return { order: updatedOfflineOrder };
        }
      }

      const response = await updateOrderServices(orderId, updateData);
      setBackendReachable(true);
      dispatch({
        type: ACTION_TYPES.UPDATE_ORDER,
        payload: response,
      });
      return response;
    } catch (error) {
      if (isNetworkError(error)) {
        setBackendReachable(false);
      }

      throw error.response?.data?.message || error.message;
    }
  }, []);

  const filterByStatus = useCallback((status) => {
    dispatch({
      type: ACTION_TYPES.FILTER_BY_STATUS,
      payload: status,
    });
  }, []);

  const filterOrderByDate = useCallback(async (day, month, year, userId) => {
    const dateKey = getOrderDateKey({ day, month, year });
    const dateFilter = { day, month, year };

    try {
      if (isForcedOfflineMode()) {
        const cachedOrders = getCachedOrdersForDate(userId, dateKey);
        const mergedOrders = mergeOrdersWithOffline(
          cachedOrders,
          userId,
          dateKey,
          dateFilter,
        );

        dispatch({
          type: ACTION_TYPES.FILTER_BY_DATE,
          payload: mergedOrders,
        });
        return mergedOrders;
      }

      const response = await filterOrderByDateServices(
        day,
        month,
        year,
        userId,
      );
      setBackendReachable(true);
      cacheOrdersForDate(userId, dateKey, response);
      const mergedOrders = mergeOrdersWithOffline(
        response,
        userId,
        dateKey,
        dateFilter,
      );
      dispatch({
        type: ACTION_TYPES.FILTER_BY_DATE,
        payload: mergedOrders,
      });
      return mergedOrders;
    } catch (error) {
      if (isNetworkError(error)) {
        setBackendReachable(false);
        const cachedOrders = getCachedOrdersForDate(userId, dateKey);
        const mergedOrders = mergeOrdersWithOffline(
          cachedOrders,
          userId,
          dateKey,
          dateFilter,
        );

        dispatch({
          type: ACTION_TYPES.FILTER_BY_DATE,
          payload: mergedOrders,
        });
        return mergedOrders;
      }

      throw error.response?.data?.message || error.message;
    }
  }, []);

  const filterOrderByNamePhone = useCallback(
    async (clientName, contactPhone, restaurantId) => {
      try {
        const response = await filterOrdersByNamePhoneServices(
          clientName,
          contactPhone,
          restaurantId,
        );
        dispatch({
          type: ACTION_TYPES.FILTER_ORDERS_BY_NAME_PHONE,
          payload: response,
        });
      } catch (error) {
        throw error.response?.data?.message || error.message;
      }
    },
    [],
  );

  const getMonthlyOrderStats = useCallback(async (restaurantId = null) => {
    try {
      const response = restaurantId
        ? await getMonthlyOrdersServices(restaurantId)
        : await getAllMonthlyOrdersServices();
      dispatch({
        type: ACTION_TYPES.GET_MONTHLY_ORDERS_STATS,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const getDailyOrderStats = useCallback(async (restaurantId) => {
    try {
      const response = await getDailyOrdersStatsServices(restaurantId);
      dispatch({
        type: ACTION_TYPES.GET_DAILY_ORDERS_STATS,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const getRidersByRestaurant = useCallback(async (restaurantId) => {
    try {
      const response = await getRidersByRestaurantServices(restaurantId);
      dispatch({
        type: ACTION_TYPES.GET_RIDERS_BY_RESTAURANT,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const addNewRider = useCallback(async (riderData) => {
    try {
      const response = await addNewRiderServices(riderData);
      dispatch({
        type: ACTION_TYPES.ADD_NEW_RIDER,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const updateRider = useCallback(async (riderData) => {
    try {
      const response = await updateRiderServices(riderData);
      dispatch({
        type: ACTION_TYPES.UPDATE_RIDER,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const addOrderToRider = useCallback(async (riderData) => {
    try {
      const response = await addOrderToRiderServices(riderData);
      dispatch({
        type: ACTION_TYPES.ADD_ORDER_TO_RIDER,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const getDailyRidersStats = useCallback(async (restaurantId) => {
    try {
      const response = await getDailyRidersStatsServices(restaurantId);
      dispatch({
        type: ACTION_TYPES.GET_DAILY_RIDERS_STATS,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const getAllRidersStats = useCallback(async (restaurantId) => {
    try {
      const response = await getAllRidersStatsServices(restaurantId);
      dispatch({
        type: ACTION_TYPES.GET_ALL_RIDERS_STATS,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const syncOfflineOrders = useCallback(async () => {
    if (isForcedOfflineMode()) return [];
    if (offlineSyncInProgress) return [];

    const pendingOrders = getPendingOfflineOrders();
    if (!pendingOrders.length) return [];

    offlineSyncInProgress = true;

    try {
      const ordersData = pendingOrders.map((offlineOrder) => {
        markOfflineOrderSyncing(offlineOrder.id);

        const {
          id: _offlineId,
          offlineOrder: _offlineOrder,
          offlineSyncStatus: _offlineSyncStatus,
          offlineSyncError: _offlineSyncError,
          offlineCreatedAt: _offlineCreatedAt,
          offlineUpdatedAt: _offlineUpdatedAt,
          offlineSyncedAt: _offlineSyncedAt,
          serverOrderId: _serverOrderId,
          ...orderData
        } = offlineOrder;

        return orderData;
      });

      const response = await syncOfflineOrdersServices(ordersData);
      const syncedOrders = response?.syncedOrders || [];
      const failedOrders = response?.failedOrders || [];

      syncedOrders.forEach(({ clientOfflineId, order }) => {
        const offlineOrder = pendingOrders.find(
          (item) => item.clientOfflineId === clientOfflineId,
        );
        if (!offlineOrder) return;

        const syncedOrder = markOfflineOrderSynced(offlineOrder.id, order);
        dispatch({
          type: ACTION_TYPES.REPLACE_ORDER,
          payload: {
            previousId: offlineOrder.id,
            order: syncedOrder || order,
          },
        });
      });

      failedOrders.forEach(({ clientOfflineId, message }) => {
        const offlineOrder = pendingOrders.find(
          (item) => item.clientOfflineId === clientOfflineId,
        );
        if (!offlineOrder) return;

        markOfflineOrderSyncError(offlineOrder.id, message);
      });

      setBackendReachable(true);
      return syncedOrders;
    } catch (error) {
      pendingOrders.forEach((order) => {
        markOfflineOrderSyncError(order.id, error);
      });

      if (isNetworkError(error)) {
        setBackendReachable(false);
      }

      throw error;
    } finally {
      offlineSyncInProgress = false;
    }
  }, []);

  useEffect(() => {
    const attemptSync = () => {
      if (!window.navigator.onLine || isForcedOfflineMode()) return;
      syncOfflineOrders().catch(() => {});
    };

    attemptSync();

    window.addEventListener("online", attemptSync);
    const intervalId = window.setInterval(attemptSync, 60000);

    return () => {
      window.removeEventListener("online", attemptSync);
      window.clearInterval(intervalId);
    };
  }, [syncOfflineOrders]);

  const contextValue = useMemo(
    () => ({
      orderState,
      getAllOrders,
      getOrderById,
      addOrder,
      updateOrder,
      filterByStatus,
      filterOrderByDate,
      filterOrderByNamePhone,
      getMonthlyOrderStats,
      getDailyOrderStats,
      getRidersByRestaurant,
      addNewRider,
      updateRider,
      addOrderToRider,
      getDailyRidersStats,
      getAllRidersStats,
      syncOfflineOrders,
    }),
    [
      orderState,
      getAllOrders,
      getOrderById,
      addOrder,
      updateOrder,
      filterByStatus,
      filterOrderByDate,
      filterOrderByNamePhone,
      getMonthlyOrderStats,
      getDailyOrderStats,
      getRidersByRestaurant,
      addNewRider,
      updateRider,
      addOrderToRider,
      getDailyRidersStats,
      getAllRidersStats,
      syncOfflineOrders,
    ],
  );

  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  return useContext(OrdersContext);
};
