export const initialCashForm = {
    registerName: 'Caja Principal',
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