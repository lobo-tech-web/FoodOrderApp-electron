import { apiWithToken } from "./axiosConfig";

// ---- URLS ----
// const apiMainURLCustomOption = import.meta.env.VITE_API_CUSTOM_OPTION_MAIN_ROUTER;
const apiGetByRestaurantURLCustomOption = import.meta.env.VITE_API_CUSTOM_OPTION_GET_ROUTER;
const apiPostCreateURLCustomOption = import.meta.env.VITE_API_CUSTOM_OPTION_POST_ROUTER;
const apiPutUpdateURLCustomOption = import.meta.env.VITE_API_CUSTOM_OPTION_PUT_ROUTER;
const apiPutAssingProductsURLCustomOption = import.meta.env.VITE_API_CUSTOM_OPTION_PUT_PRODUCTS_ROUTER;
const apiDeleteURLCustomOption = import.meta.env.VITE_API_CUSTOM_OPTION_DELETE_ROUTER;
// --------------

export const getCustomOptionByRestaurantServices = async (userId) => {
    try {
        const response = await apiWithToken.get(`${apiGetByRestaurantURLCustomOption}?userId=${userId}`);
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

export const postCreateCustomOptionServices = async (data) => {
    try {
        const response = await apiWithToken.post(apiPostCreateURLCustomOption, { data });
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

export const putUpdateCustomOptionServices = async (data) => {
    try {
        const response = await apiWithToken.put(apiPutUpdateURLCustomOption, { data });
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

export const assignProductsToCustomOptionServices = async (data) => {
    try {
        const response = await apiWithToken.put(apiPutAssingProductsURLCustomOption, { data });
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

export const deleteCustomOptionServices = async (id, userId) => {
    try {
        const response = await apiWithToken.delete(apiDeleteURLCustomOption, {
            params: {
                id,
                userId,
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
    };
};