export const initialForm = {
    name: '',
    email: '',
    password: '',
    phone: '',
    staffRole: 'cashier',
};

export const DEFAULT_STAFF_PERMISSIONS = {
    cashier: {
        orders: {
            read: true,
            create: true,
            updateStatus: true,
            cancel: false,
            edit: false,
        },
        clients: {
            read: true,
            create: true,
        },
        cashRegister: {
            open: true,
            close: false,
            movements: true,
            readReport: false,
        },
        sales: {
            read: false,
        },
        settings: {
            read: false,
            update: false,
        },
    },

    manager: {
        orders: {
            read: true,
            create: true,
            updateStatus: true,
            cancel: true,
            edit: true,
        },
        clients: {
            read: true,
            create: true,
        },
        cashRegister: {
            open: true,
            close: true,
            movements: true,
            readReport: true,
        },
        sales: {
            read: true,
        },
        settings: {
            read: false,
            update: false,
        },
    },

    kitchen: {
        orders: {
            read: true,
            create: false,
            updateStatus: true,
            cancel: false,
            edit: false,
        },
        clients: {
            read: false,
            create: false,
        },
        cashRegister: {
            open: false,
            close: false,
            movements: false,
            readReport: false,
        },
        sales: {
            read: false,
        },
        settings: {
            read: false,
            update: false,
        },
    },
};

export const ROLE_OPTIONS = [
    {
        value: 'cashier',
        label: 'Cajero',
        description: 'Toma pedidos, puede abrir caja y registrar movimientos.',
    },
    {
        value: 'manager',
        label: 'Encargado',
        description: 'Puede cerrar caja, ver reportes y administrar operaciones.',
    },
    {
        value: 'kitchen',
        label: 'Cocina',
        description: 'Ve pedidos y cambia estados de preparación.',
    },
];

export const getRoleLabel = (role) => {
    return ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
};

export const normalizeStaffUsername = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
};