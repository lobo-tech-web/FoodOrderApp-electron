import { apiWithToken } from './axiosConfig.js';

const apiURLOrderAudit = import.meta.env.VITE_API_GET_ORDER_AUDIT;

const handleServiceError = (error, fallbackMessage) => {
    if (error?.response) {
        throw {
            status: error.response.status,
            message: error.response.data?.message || fallbackMessage,
        };
    }

    throw {
        message: error?.message || fallbackMessage,
    };
};

export const getOrderAuditLogsService = async (orderId) => {
    try {
        const response = await apiWithToken.get(
            `${apiURLOrderAudit}?orderId=${orderId}`
        );

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al obtener auditoría del pedido');
    }
};

export const getDailyOrderAuditService = async ({ date, restaurantId = null } = {}) => {
    try {

        if (!date) throw new Error('fecha requerida');

        const params = { date };

        if (restaurantId) params.restaurantId = restaurantId;

        const response = await apiWithToken.get(
            `${apiURLOrderAudit}/daily`, { params }
        );

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al obtener auditoría diaria');
    }
};