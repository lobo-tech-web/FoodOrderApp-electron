import { apiWithToken } from "./axiosConfig.js";

// ---- URLS ----
const apiURLMainUserPoints = import.meta.env.VITE_API_POINTS_USER_MAIN_ROUTER;
const apiURLAddUserPoints = import.meta.env.VITE_API_POINTS_USER_ADD_ROUTER;
const apiURLRemoveUserPoints = import.meta.env.VITE_API_POINTS_USER_REMOVE_ROUTER;
// --------------

// OBTENER TODOS LOS PUNTOS DADOS CON USER POINTS
export const getAllUserPointsService = async (userId, restaurantId) => {
    try {
        let response;
        if (userId) response = await apiWithToken.get(`${apiURLMainUserPoints}?userId=${userId}`);
        else if (restaurantId) response = await apiWithToken.get(`${apiURLMainUserPoints}?restaurantId=${restaurantId}`);
        else response = await apiWithToken.get(apiURLMainUserPoints);
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

// AGREGAR PUNTOS A UN USUARIO
export const addUserPointsService = async (dataPoints) => {
    try {
        const response = await apiWithToken.post(apiURLAddUserPoints, { dataPoints });
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

// REMOVER PUNTOS A UN USUARIO
export const removeUserPointsService = async (dataPoints) => {
    try {
        const response = await apiWithToken.post(apiURLRemoveUserPoints, { dataPoints });
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