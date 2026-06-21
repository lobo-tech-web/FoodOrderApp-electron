import { api, apiWithToken } from "./axiosConfig";

// ---- URLS ----
const apiMainURLOrders = import.meta.env.VITE_API_ORDERS_MAIN_ROUTER;
const apiGetUserOrders = import.meta.env.VITE_API_ORDERS_BY_USER_ROUTER;
const apiFilterNamePhoneURLOrders = import.meta.env.VITE_API_ORDERS_FILTER_ROUTER;
const apiFilterByDateURLOrders = import.meta.env.VITE_API_ORDERS_FILTER_BY_DATE_ROUTER;
const apiGetIDURLOrders = import.meta.env.VITE_API_ORDERS_ID_ROUTER;
const apiGetDailyStatsURLOrders = import.meta.env.VITE_API_ORDERS_DAILY_STATS_ROUTER;
const apiGetMonthlyStatsURLOrders = import.meta.env.VITE_API_ORDERS_MONTHLY_STATS_ROUTER;
const apiGetAllMonthlyStatsURLOrders = import.meta.env.VITE_API_ORDERS_ALL_MONTHLY_STATS_ROUTER;
const apiPutURLOrders = import.meta.env.VITE_API_ORDERS_PUT_ROUTER;
const apiPutArrayURLOrders = import.meta.env.VITE_API_ORDERS_PUT_ARRAY_ROUTER;
const apiPostURLOrders = import.meta.env.VITE_API_ORDERS_POST_ROUTER;
const apiDeleteURLOrders = import.meta.env.VITE_API_ORDERS_DELETE_ROUTER;
// <------------

export const getAllOrdersServices = async (userId = null, restaurantId = null) => {
    try {
        let queryParams = [];

        if (userId) queryParams.push(`userId=${userId}`);
        if (restaurantId) queryParams.push(`restaurantId=${restaurantId}`);

        const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
        const response = await apiWithToken.get(`${apiMainURLOrders}${queryString}`);

        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const getAllOrdersFromUserServices = async (userId) => {
    try {
        const response = await apiWithToken.get(`${apiGetUserOrders}?userId=${userId}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const filterOrderByDateServices = async (day, month, year, restaurantId) => {
    try {
        const response = await apiWithToken.get(`${apiFilterByDateURLOrders}?day=${day}&month=${month}&year=${year}&restaurantId=${restaurantId}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const filterOrdersByNamePhoneServices = async (clientName, contactPhone, restaurantId) => {
    try {
        let url = `${apiFilterNamePhoneURLOrders}?restaurantId=${restaurantId}`;
        if (clientName) url += `&clientName=${clientName}`;
        if (contactPhone) url += `&contactPhone=${contactPhone}`;

        const response = await apiWithToken.get(url);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const getByOrderIDServices = async (orderID) => {
    try {
        const response = await apiWithToken.get(`${apiGetIDURLOrders}/${orderID}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const updateOrderServices = async (orderId, updateData) => {
    try {
        // AGREGAR PARA ENVIAR LA orderId Y EL orderData
        const response = await apiWithToken.put(`${apiPutURLOrders}?orderId=${orderId}`, { updateData });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const updateArrayOrderServices = async (orderData) => {
    try {
        const payload = {
            ...orderData,
            orderList: Array.isArray(orderData.orderList)
                ? orderData.orderList
                : typeof orderData.orderList === 'string'
                    ? JSON.parse(orderData.orderList)
                    : [],
        }
        const response = await apiWithToken.put(apiPutArrayURLOrders, { ordersData: payload });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const addNewOrderServices = async (orderData) => {
    try {
        const response = await api.post(apiPostURLOrders, { orderData });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const getDailyOrdersStatsServices = async (restaurantId) => {
    try {
        const response = await apiWithToken.get(`${apiGetDailyStatsURLOrders}?restaurantId=${restaurantId}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
}

export const getMonthlyOrdersServices = async (restaurantId) => {
    try {
        const response = await apiWithToken.get(`${apiGetMonthlyStatsURLOrders}?restaurantId=${restaurantId}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
}

export const getAllMonthlyOrdersServices = async () => {
    try {
        const response = await apiWithToken.get(apiGetAllMonthlyStatsURLOrders);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
}

// ELIMINAR PRODUCTO
export const deleteOrderService = async (orderData) => {
    try {
        const response = await apiWithToken.delete(apiDeleteURLOrders, { data: orderData });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};