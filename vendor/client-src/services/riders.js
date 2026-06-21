import { apiWithToken } from "./axiosConfig";

// ---- URLS ----
// const apiMainURLRiders = import.meta.env.VITE_API_RIDERS_MAIN_ROUTER;
const apiGetByRestaurantURLRiders = import.meta.env.VITE_API_RIDERS_GET_BY_RESTAURANT_ROUTER;
const apiPostCreateURLRiders = import.meta.env.VITE_API_RIDERS_POST_CREATE_ROUTER;
const apiPutUpdateRiderURLRiders = import.meta.env.VITE_API_RIDERS_PUT_UPDATE_ROUTER;
// const apiPutAdjustmentDeliveryURLRiders = import.meta.env.VITE_API_RIDERS_PUT_ADJUSTMENT_DELIVERY_ROUTER;
const apiPutAddURLRiders = import.meta.env.VITE_API_RIDERS_PUT_ADD_ORDER_ROUTER;
const apiDailyStatsURLRiders = import.meta.env.VITE_API_RIDERS_DAILY_STATS_ROUTER;
const apiAllStatsURLRiders = import.meta.env.VITE_API_RIDERS_ALL_STATS_ROUTER;
// --------------

export const getRidersByRestaurantServices = async (restaurantId) => {
    try {
        const response = await apiWithToken.get(`${apiGetByRestaurantURLRiders}?restaurantId=${restaurantId}`);
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
    };
};

export const addNewRiderServices = async (riderData) => {
    try {
        const response = await apiWithToken.post(apiPostCreateURLRiders, { riderData });
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
    };
};

export const updateRiderServices = async (riderData) => {
    try {
        const response = await apiWithToken.put(apiPutUpdateRiderURLRiders, { riderData });
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
    };
}

export const addOrderToRiderServices = async (riderData) => {
    try {
        const response = await apiWithToken.put(apiPutAddURLRiders, { riderData });
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
    };
};

export const getDailyRidersStatsServices = async (restaurantId) => {
    try {
        const response = await apiWithToken.get(`${apiDailyStatsURLRiders}?restaurantId=${restaurantId}`);
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
    };
};

export const getAllRidersStatsServices = async (restaurantId) => {
    try {
        const response = await apiWithToken.get(`${apiAllStatsURLRiders}?restaurantId=${restaurantId}`);
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
    };
};