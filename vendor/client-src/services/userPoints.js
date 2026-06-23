import { apiWithToken } from "./axiosConfig.js";

// ---- URLS ----
const apiURLMainUserPoints = import.meta.env.VITE_API_POINTS_USER_MAIN_ROUTER;
const apiURLAddUserPoints = import.meta.env.VITE_API_POINTS_USER_ADD_ROUTER;
const apiURLRemoveUserPoints = import.meta.env.VITE_API_POINTS_USER_REMOVE_ROUTER;
// --------------

// OBTENER TODOS LOS PUNTOS DADOS CON USER POINTS
export const getAllUserPointsService = async (params = {}) => {
    try {
        const {
            userId,
            restaurantId,
            userNumber,
            search,
        } = params;

        const response = await apiWithToken.get(apiURLMainUserPoints, {
            params: {
                ...(userId !== undefined && userId !== null && userId !== ""
                    ? { userId }
                    : {}),
                ...(restaurantId !== undefined &&
                restaurantId !== null &&
                restaurantId !== ""
                    ? { restaurantId }
                    : {}),
                ...(userNumber !== undefined &&
                userNumber !== null &&
                userNumber !== ""
                    ? { userNumber }
                    : {}),
                ...(typeof search === "string" && search.trim()
                    ? { search: search.trim() }
                    : {}),
            },
        });

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
