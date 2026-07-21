import { apiWithToken } from './axiosConfig';

// ---- URLS ----
const apiURLMainUserPointsHistory = import.meta.env.VITE_API_HISTORY_POINTS_MAIN_ROUTER;
// --------------

export const getUserPointsHistoryService = async ({
    restaurantId,
    userId,
    orderId,
    movementType,
    reason,
    dateFrom,
    dateTo,
    page = 1,
    limit = 50,
}) => {
    try {
        const response = await apiWithToken.get(apiURLMainUserPointsHistory, {
            params: {
                restaurantId,
                userId,
                orderId,
                movementType,
                reason,
                dateFrom,
                dateTo,
                page,
                limit,
            },
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message:
                    error.response.data.message ||
                    'Error desconocido al obtener historial de puntos',
            };
        }

        throw {
            message:
                error.message || 'Error desconocido al conectar con el servidor',
        };
    }
};