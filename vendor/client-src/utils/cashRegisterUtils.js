export const initialCashForm = {
    cashRegisterId: "",
    openingAmount: '',
    note: '',
};

export const hasPermission = (user, moduleName, actionName) => {
    if (user?.role === 'admin') return true;

    return user?.permissions?.[moduleName]?.[actionName] === true;
};

export const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
    });
};

// ----
const CASH_REGISTER_SELECTION_PREFIX = "lobotech:selectedCashRegister";

export const getCashRegisterSelectionKey = ({ user, restaurantId }) => {
    if (!user?.id || !restaurantId) return null;

    return [
        CASH_REGISTER_SELECTION_PREFIX,
        restaurantId,
        user.role || "unknown",
        user.id,
    ].join(":");
};

export const getStoredCashRegisterId = ({ user, restaurantId }) => {
    const key = getCashRegisterSelectionKey({
        user,
        restaurantId,
    });

    if (!key) return null;

    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

export const setStoredCashRegisterId = ({
    user,
    restaurantId,
    cashRegisterId,
}) => {
    const key = getCashRegisterSelectionKey({
        user,
        restaurantId,
    });

    if (!key || !cashRegisterId) return;

    try {
        window.localStorage.setItem(key, cashRegisterId);
    } catch {
        // La selección puede seguir funcionando
        // aunque localStorage no esté disponible.
    }
};

export const clearStoredCashRegisterId = ({ user, restaurantId }) => {
    const key = getCashRegisterSelectionKey({
        user,
        restaurantId,
    });

    if (!key) return;

    try {
        window.localStorage.removeItem(key);
    } catch {
        // No hacemos nada.
    }
};

/**
 * Obtiene la fecha de hoy en Argentina,
 * Devuelve: YYYY-MM-DD
 */
export const getArgentinaTodayDateKey = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const getPart = (type) => parts.find((part) => part.type === type)?.value;

    return [getPart("year"), getPart("month"), getPart("day")].join("-");
};

/**
 * Generamos un nuevo objeto cada vez que
 * necesitamos establecer los filtros iniciales.
 */
export const createInitialCashFilters = () => {
    const today = getArgentinaTodayDateKey();

    return {
        cashRegisterId: "ALL",
        status: "ALL",
        from: today,
        to: today,
    };
};