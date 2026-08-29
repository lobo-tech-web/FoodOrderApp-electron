import { apiWithToken } from './axiosConfig.js';

// ---- URLS ----
const apiGetByRestaurantURL = import.meta.env.VITE_API_RIDER_CASH_CLOSURE_GET_BY_RESTAURANT_ROUTER;
const apiGetByIdURL = import.meta.env.VITE_API_RIDER_CASH_CLOSURE_GET_BY_ID_ROUTER;
const apiGetPendingDeliveriesURL = import.meta.env.VITE_API_RIDER_CASH_CLOSURE_GET_PENDING_DELIVERIES_ROUTER;
const apiPostOpenURL = import.meta.env.VITE_API_RIDER_CASH_CLOSURE_POST_OPEN_ROUTER;
const apiPostPreviewURL = import.meta.env.VITE_API_RIDER_CASH_CLOSURE_POST_PREVIEW_ROUTER;
const apiPostCloseURL = import.meta.env.VITE_API_RIDER_CASH_CLOSURE_POST_CLOSE_ROUTER;
const apiPutUpdateURL = import.meta.env.VITE_API_RIDER_CASH_CLOSURE_PUT_UPDATE_ROUTER;
// --------------


const handleServiceError = (error) => {
    if (error.response) {
        throw {
            status: error.response.status,
            message:
                error.response.data?.message ||
                'Error desconocido en la respuesta del servidor',
        };
    }

    throw {
        message:
            error.message ||
            'Error desconocido al intentar conectarse al servidor',
    };
};


export const getOrCreateOpenRiderCashClosureService = async ({
    restaurantId,
    riderId,
    initialCash = 0,
    dateKey,
    closureDateKey,
    closureDateLabel,
}) => {
    try {
        const response = await apiWithToken.post(apiPostOpenURL, {
            restaurantId,
            riderId,
            initialCash,
            dateKey: dateKey || closureDateKey || null,
            closureDateKey: closureDateKey || dateKey || null,
            closureDateLabel,
        });

        return response.data;
    } catch (error) {
        handleServiceError(error);
    }
};


export const previewRiderCashClosureService = async ({
    restaurantId,
    riderId,
    initialCash = 0,
    cashDelivered = 0,
    adjustments = [],
    dateKey,
    closureDateKey,
}) => {
    try {
        const response = await apiWithToken.post(apiPostPreviewURL, {
            restaurantId,
            riderId,
            initialCash,
            cashDelivered,
            adjustments,
            dateKey: dateKey || closureDateKey || null,
            closureDateKey: closureDateKey || dateKey || null,
        });

        return response.data;
    } catch (error) {
        handleServiceError(error);
    }
};


export const updateOpenRiderCashClosureService = async ({
    closureId,
    initialCash,
    cashDelivered,
    adjustments,
    notes,
}) => {
    try {
        const response = await apiWithToken.put(
            `${apiPutUpdateURL}?closureId=${closureId}`,
            {
                initialCash,
                cashDelivered,
                adjustments,
                notes,
            }
        );

        return response.data;
    } catch (error) {
        handleServiceError(error);
    }
};


export const closeRiderCashClosureService = async ({ closureId }) => {
    try {
        const response = await apiWithToken.post(
            `${apiPostCloseURL}?closureId=${closureId}`
        );

        return response.data;
    } catch (error) {
        handleServiceError(error);
    }
};


export const getRiderCashClosureByIdService = async ({ closureId }) => {
    try {
        const response = await apiWithToken.get(
            `${apiGetByIdURL}?closureId=${closureId}`
        );

        return response.data;
    } catch (error) {
        handleServiceError(error);
    }
};

export const getPendingRiderDeliveriesSummaryService = async ({ restaurantId }) => {
    try {
        const response = await apiWithToken.get(
            `${apiGetPendingDeliveriesURL}?restaurantId=${restaurantId}`
        );

        return response.data;
    } catch (error) {
        handleServiceError(error);
    }
};


export const getRiderCashClosuresByRestaurantService = async ({
    restaurantId,
    riderId,
    status,
    limit = 80,
}) => {
    try {
        const params = new URLSearchParams();

        if (restaurantId) params.append('restaurantId', restaurantId);
        if (riderId) params.append('riderId', riderId);
        if (status) params.append('status', status);
        if (limit) params.append('limit', limit);

        const response = await apiWithToken.get(
            `${apiGetByRestaurantURL}?${params.toString()}`
        );

        return response.data;
    } catch (error) {
        handleServiceError(error);
    }
};