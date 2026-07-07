const USER_ACCOUNT_UPDATE_FIELDS = [
    'id',
    'email',
    'name',
    'cuit',
    'phone',
    'address',
    'city',
    'state',
    'postalCode',
];

const USER_BUSINESS_UPDATE_FIELDS = [
    'businessName',
    'workingHours',
    'whatsappNumber',
    'mercadoPagoLink',
    'transferPaymentAlias',
    'businessLogoFile',
    'businessLogoUrl',
    'businessUrl',
    'businessSlug',
    'customDomain',
    'paymentMethods',
    'enabledOrderTypes',
    'tablesConfig',
];

const USER_DEV_UPDATE_FIELDS = ['status', 'role'];

const pickFields = (userData = {}, fields = []) => {
    return fields.reduce((payload, field) => {
        if (userData[field] !== undefined) {
            payload[field] = userData[field];
        }

        return payload;
    }, {});
};

const USER_UPDATE_ALLOWED_FIELDS = [
    'id',
    'userNumber',
    'email',
    'name',
    'cuit',
    'phone',
    'address',
    'city',
    'state',
    'postalCode',
    'businessName',
    'workingHours',
    'whatsappNumber',
    'mercadoPagoLink',
    'transferPaymentAlias',
    'businessLogoFile',
    'businessLogoUrl',
    'businessLogoId',
    'businessUrl',
    'businessSlug',
    'customDomain',
    'paymentMethods',
    'enabledOrderTypes',
    'tablesConfig',
    'status',
    'role',
    'lastLoginAt',
];

export const pickUserUpdatePayload = (userData = {}) => {
    return USER_UPDATE_ALLOWED_FIELDS.reduce((payload, field) => {
        if (userData[field] !== undefined) {
            payload[field] = userData[field];
        }

        return payload;
    }, {});
};

const isValidTime = (time = '') => {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
};

const isValidTimeRange = (range = '') => {
    const [open, close] = String(range).split('-');

    return isValidTime(open) && isValidTime(close);
};

export const normalizeWorkingHoursForBack = (workingHours = {}) => {
    return Object.entries(workingHours || {}).reduce((acc, [day, value]) => {
        if (value === '') {
            acc[day] = [];
            return acc;
        }

        if (Array.isArray(value)) {
            acc[day] = value
                .map((time) => String(time).trim())
                .filter(Boolean)
                .filter(isValidTimeRange);

            return acc;
        }

        if (typeof value === 'string') {
            acc[day] = value
                .split(',')
                .map((time) => time.trim())
                .filter(Boolean)
                .filter(isValidTimeRange);

            return acc;
        }

        acc[day] = [];
        return acc;
    }, {});
};

export const buildLocalSettingsPayload = (userData = {}) => {
    return {
        ...pickFields(userData, [
            'id',
            'businessName',
            'businessLogoFile',
            'businessLogoUrl',
            'businessUrl',
            'mercadoPagoLink',
            'transferPaymentAlias',
            'whatsappNumber',
            'paymentMethods',
            'enabledOrderTypes',
            'tablesConfig',
        ]),
        workingHours: normalizeWorkingHoursForBack(userData.workingHours),
    };
};

export const buildModalEditUserPayload = ({
    userData = {},
    viewerRole = 'user',
}) => {
    const basePayload = pickFields(userData, USER_ACCOUNT_UPDATE_FIELDS);

    const businessPayload =
        userData.role === 'admin' || userData.businessName
            ? {
                ...pickFields(userData, USER_BUSINESS_UPDATE_FIELDS),
                workingHours: normalizeWorkingHoursForBack(userData.workingHours),
            }
            : {};

    const devPayload =
        viewerRole === 'dev' ? pickFields(userData, USER_DEV_UPDATE_FIELDS) : {};

    return {
        id: userData.id,
        ...basePayload,
        ...businessPayload,
        ...devPayload,
    };
};

export const buildFullUserUpdatePayload = (userData = {}) => {
    return {
        ...pickFields(userData, [
            ...USER_ACCOUNT_UPDATE_FIELDS,
            ...USER_BUSINESS_UPDATE_FIELDS,
            ...USER_DEV_UPDATE_FIELDS,
        ]),
        workingHours: normalizeWorkingHoursForBack(userData.workingHours),
    };
};

export const initialUpdateUserState = {
    id: '',
    userNumber: '',
    email: '',
    name: '',
    cuit: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    businessName: '',
    workingHours: {},
    whatsappNumber: '',
    mercadoPagoLink: '',
    transferPaymentAlias: '',
    businessUrl: '',
    businessLogoUrl: '',
    businessLogoId: '',
    businessLogoFile: null,
    businessSlug: '',
    customDomain: '',
    paymentMethods: ['MERCADO PAGO', 'TRANSFERENCIA', 'EFECTIVO', 'SIN ESPECIFICAR'],
    enabledOrderTypes: ['RETIRO EN LOCAL', 'CONSUMIR EN LOCAL', 'DELIVERY', 'ESPERA EN LOCAL'],
    tablesConfig: [],
    status: true,
    role: 'user',
    lastLoginAt: null,
};

export const initialCreateUserState = {
    email: '',
    password: '',
    name: '',
    cuit: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
};