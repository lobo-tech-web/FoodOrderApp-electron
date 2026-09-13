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