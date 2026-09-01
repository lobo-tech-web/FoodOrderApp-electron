import { api, apiWithToken, getDesktopClientHeaders } from './axiosConfig.js';

// ---- Urls ----
const apiURLMainRestaurantStaff = import.meta.env.VITE_API_RESTAURANT_STAFF_MAIN_ROUTER;
const apiURLCreateRestaurantStaff = import.meta.env.VITE_API_RESTAURANT_STAFF_REGISTER_ROUTER;
const apiURLLoginRestaurantStaff = import.meta.env.VITE_API_RESTAURANT_STAFF_LOGIN_ROUTER;
const apiURLUpdateRestaurantStaff = import.meta.env.VITE_API_RESTAURANT_STAFF_UPDATE_ROUTER;
// --------------

export const getRestaurantStaffService = async (restaurantId) => {
    try {
        const response = await apiWithToken.get(`${apiURLMainRestaurantStaff}?restaurantId=${restaurantId}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message:
                    error.response.data.message ||
                    'Error desconocido al obtener empleados',
            };
        }

        throw {
            message:
                error.message ||
                'Error desconocido al intentar conectarse al servidor',
        };
    }
};

export const createRestaurantStaffService = async (data) => {
    try {
        const response = await apiWithToken.post(apiURLCreateRestaurantStaff,
            { data }
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message:
                    error.response.data.message ||
                    'Error desconocido al crear empleado',
            };
        }

        throw {
            message:
                error.message ||
                'Error desconocido al intentar conectarse al servidor',
        };
    }
};

export const loginRestaurantStaffService = async (data) => {
    try {
        const response = await api.post(apiURLLoginRestaurantStaff,
            { data },
            { headers: getDesktopClientHeaders() }
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message:
                    error.response.data.message ||
                    'Error desconocido al crear empleado',
            };
        }

        throw {
            message:
                error.message ||
                'Error desconocido al intentar conectarse al servidor',
        };
    }
};

export const updateRestaurantStaffService = async (staffId, data) => {
    try {
        const response = await apiWithToken.put(apiURLUpdateRestaurantStaff,
            { staffId, data }
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message:
                    error.response.data.message ||
                    'Error desconocido al actualizar empleado',
            };
        }

        throw {
            message:
                error.message ||
                'Error desconocido al intentar conectarse al servidor',
        };
    }
};
