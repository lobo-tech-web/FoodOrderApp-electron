export const DEFAULT_STAFF_PERMISSIONS = {
    cashier: {
        orders: {
            read: true,
            create: true,
            updateStatus: true,
            cancel: true,
            edit: true,
            readAudit: false,
        },
        clients: {
            read: true,
            create: true,
        },
        cashRegister: {
            open: true,
            close: true,
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
            readAudit: true,
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
            readAudit: false,
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
        label: 'CAJERO',
        description: 'Toma pedidos y edita pedidos, puede abrir/cerrar caja y registrar movimientos.',
    },
    {
        value: 'manager',
        label: 'ENCARGADO',
        description: 'Puede cerrar caja, ver reportes y administrar operaciones.',
    },
    {
        value: 'kitchen',
        label: 'COCINA',
        description: 'Ve pedidos y cambia estados de preparación.',
    },
];

export const getRoleLabel = (role) => {
    return ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
};

export const cloneStaffPermissions = (
    permissions
) => {
    return JSON.parse(JSON.stringify(permissions || {}));
};

export const getStaffRolePermissions = (
    staffRole = 'cashier'
) => {
    return cloneStaffPermissions(
        DEFAULT_STAFF_PERMISSIONS[staffRole] ||
        DEFAULT_STAFF_PERMISSIONS.cashier
    );
};

export const createInitialStaffForm = (
    staffRole = 'cashier'
) => ({
    name: '',
    email: '',
    password: '',
    phone: '',
    staffRole,
    permissions: getStaffRolePermissions(staffRole),
});

export const initialForm = createInitialStaffForm();

export const normalizeStaffUsername = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
};