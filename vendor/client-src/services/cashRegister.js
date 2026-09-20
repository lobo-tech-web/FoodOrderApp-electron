import { apiWithToken } from './axiosConfig.js';

const apiURLMainCashRegister = import.meta.env.VITE_API_CASH_REGISTER_MAIN_ROUTER;
const apiURLGetOpenCashSession = import.meta.env.VITE_API_CASH_REGISTER_GET_OPEN_SESSIONS;
const apiURLGetCashSessions = import.meta.env.VITE_API_CASH_REGISTER_GET_CASH_SESSIONS;
const apiURLGetConsolidatedReport = import.meta.env.VITE_API_CASH_REGISTER_GET_CONSOLIDATED_REPORT;
const apiURLGetCashReport = import.meta.env.VITE_API_CASH_REGISTER_GET_CASH_REPORT;
const apiURLGetClosePreview = import.meta.env.VITE_API_CASH_REGISTER_GET_CLOSE_PREVIEW;
const apiURLPostCashMovement = import.meta.env.VITE_API_CASH_REGISTER_POST_CASH_MOVEMENT;
const apiURLPostOpenRegister = import.meta.env.VITE_API_CASH_REGISTER_POST_OPEN_REGISTER;
const apiURLPostCloseRegister = import.meta.env.VITE_API_CASH_REGISTER_POST_CLOSE_REGISTER;

const handleServiceError = (error, fallbackMessage) => {
    if (error.response) {
        throw {
            status: error.response.status,
            message: error.response.data.message || fallbackMessage,
        };
    }

    throw {
        message: error.message || 'Error desconocido al intentar conectarse al servidor',
    };
};

const buildQuery = (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();

    return queryString ? `?${queryString}` : '';
};

export const getCashRegistersService = async ({ restaurantId = null, includeInactive = false } = {}) => {
    try {
        const params = { includeInactive };

        if (restaurantId) {
            params.restaurantId = restaurantId;
        }

        const response = await apiWithToken.get(apiURLMainCashRegister,
            { params }
        );

        return response.data;
    } catch (error) {
        handleServiceError(error, "Error al obtener cajas");
    }
};

export const createCashRegisterService = async (data) => {
    try {

        const response = await apiWithToken.post(apiURLMainCashRegister,
            { data }
        );

        return response.data;
    } catch (error) {
        handleServiceError(error, "Error al crear caja");
    }
};

export const updateCashRegisterService = async (cashRegisterId, data) => {
    try {
        if (!cashRegisterId) {
            throw new Error("cashRegisterId requerido");
        }

        const response = await apiWithToken.put(`${apiURLMainCashRegister}/${cashRegisterId}`,
            { data }
        );

        return response.data;
    } catch (error) {
        handleServiceError(error, "Error al modificar caja");
    }
};

export const getOpenCashSessionService = async ({
    restaurantId,
    cashRegisterId = null,
    registerCode = null,
} = {}) => {
    try {
        const query = buildQuery({
            restaurantId,
            cashRegisterId,
            registerCode,
        });

        const response = await apiWithToken.get(`${apiURLGetOpenCashSession}${query}`);

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al obtener caja abierta');
    }
};

export const getCashSessionsService = async ({
    restaurantId,
    cashRegisterId = null,
    status = null,
    from = null,
    to = null,
    limit = 30,
} = {}) => {
    try {
        const query = buildQuery({
            restaurantId,
            cashRegisterId,
            status,
            from,
            to,
            limit,
        });

        const response = await apiWithToken.get(`${apiURLGetCashSessions}${query}`);

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al obtener historial de cajas');
    }
};

export const getCashConsolidatedReportService = async ({
    restaurantId,
    cashRegisterId = null,
    status = null,
    from = null,
    to = null,
} = {}) => {

    try {
        const query = buildQuery({
            restaurantId,
            cashRegisterId,
            status,
            from,
            to,
        });

        const response = await apiWithToken.get(`${apiURLGetConsolidatedReport}${query}`);

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al obtener reporte consolidado de cajas');
    }
};

export const getCashSessionReportService = async (cashSessionId) => {
    try {
        const query = buildQuery({ cashSessionId });

        const response = await apiWithToken.get(`${apiURLGetCashReport}${query}`);

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al obtener reporte de caja');
    }
};

export const getCashClosePreviewService = async (cashSessionId) => {
    try {
        if (!cashSessionId) throw new Error("cashSessionId requerido");

        const query = buildQuery({ cashSessionId });

        const response = await apiWithToken.get(`${apiURLGetClosePreview}${query}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error?.response?.data?.message ||
            error?.message ||
            "Error al obtener el resumen de cierre"
        );
    }
};

export const createCashMovementService = async (data) => {
    try {
        const response = await apiWithToken.post(apiURLPostCashMovement, {
            data,
        });

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al crear movimiento de caja');
    }
};

export const openCashRegisterSessionService = async (data) => {
    try {
        const response = await apiWithToken.post(apiURLPostOpenRegister,
            { data }
        );

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al abrir caja');
    }
};

export const closeCashRegisterSessionService = async (cashSessionId, data) => {
    try {
        const query = buildQuery({
            cashSessionId,
        });

        const response = await apiWithToken.post(
            `${apiURLPostCloseRegister}${query}`,
            {
                data,
            }
        );

        return response.data;
    } catch (error) {
        handleServiceError(error, 'Error al cerrar caja');
    }
};