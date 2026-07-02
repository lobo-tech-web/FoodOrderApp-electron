import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from "react";

// ---- ORDERS SERVICE ----
import {
  getAllOrdersServices,
  getByOrderIDServices,
  updateOrderServices,
  addNewOrderServices,
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
};

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
        const response = await getAllOrdersServices(userId, restaurantId);
        dispatch({
          type: ACTION_TYPES.GET_ALL_ORDERS,
          payload: response,
        });
        return response;
      } catch (error) {
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
      const response = await addNewOrderServices(data);
      const createdOrder = response?.order || response;
      dispatch({
        type: ACTION_TYPES.ADD_ORDER,
        payload: createdOrder,
      });
      return createdOrder;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const updateOrder = useCallback(async (orderId, updateData) => {
    try {
      const response = await updateOrderServices(orderId, updateData);
      dispatch({
        type: ACTION_TYPES.UPDATE_ORDER,
        payload: response,
      });
      return response;
    } catch (error) {
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
    try {
      const response = await filterOrderByDateServices(
        day,
        month,
        year,
        userId,
      );
      dispatch({
        type: ACTION_TYPES.FILTER_BY_DATE,
        payload: response,
      });
      return response;
    } catch (error) {
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
