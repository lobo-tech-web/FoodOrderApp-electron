export const ORDER_STATUS = {
    PENDING: 'PENDIENTE A CONFIRMAR',
    PREPARING: 'EN PREPARACIÓN',
    SHIPPING: 'EN ENVIO',
    FINISHED: 'FINALIZADO',
    CANCELLED: 'CANCELADO',
};

export const isTerminalOrderStatus = (status) => {
    return (
        status === ORDER_STATUS.FINISHED ||
        status === ORDER_STATUS.CANCELLED
    );
};

export const hasOrderPermission = (user, permission) => {
    if (user?.role === 'admin' || user?.role === 'dev') {
        return true;
    }

    if (user?.role !== 'staff') {
        return false;
    }

    return user?.permissions?.orders?.[permission] === true;
};

export const getOrderEditCapabilities = ({
    originalStatus,
    user,
    cashSession = null,
}) => {
    const isAdmin =
        user?.role === 'admin' ||
        user?.role === 'dev';

    const isStaff = user?.role === 'staff';

    const isTerminal = isTerminalOrderStatus(originalStatus);

    if (isAdmin) {
        return {
            hasOpenCash: true,
            isTerminal: false,

            canEditItems: true,
            canEditClient: true,
            canEditPayment: true,
            canEditDelivery: true,
            canEditRider: true,
            canEditCommentary: true,

            canUpdateStatus: true,
            canCancel: true,

            canModifyAnything: true,
        };
    }

    const hasOpenCash =
        !isStaff ||
        (
            cashSession?.id &&
            cashSession?.status === 'OPEN'
        );

    const canEditPermission = hasOrderPermission(user, 'edit');

    const canUpdateStatusPermission = hasOrderPermission(
        user,
        'updateStatus'
    );

    const canCancelPermission = hasOrderPermission(
        user,
        'cancel'
    );

    const isPending =
        originalStatus === ORDER_STATUS.PENDING;

    const isPreparing =
        originalStatus === ORDER_STATUS.PREPARING;

    const isShipping =
        originalStatus === ORDER_STATUS.SHIPPING;

    return {
        hasOpenCash,
        isTerminal,

        canEditItems:
            hasOpenCash &&
            canEditPermission &&
            isPending,

        canEditClient:
            hasOpenCash &&
            canEditPermission &&
            (isPending || isPreparing),

        canEditPayment:
            hasOpenCash &&
            canEditPermission &&
            (isPending || isPreparing),

        canEditDelivery:
            hasOpenCash &&
            canEditPermission &&
            (isPending || isPreparing),

        canEditRider:
            hasOpenCash &&
            canEditPermission &&
            !isTerminal,

        canEditCommentary:
            hasOpenCash &&
            canEditPermission &&
            !isTerminal,

        canUpdateStatus:
            hasOpenCash &&
            canUpdateStatusPermission &&
            !isTerminal,

        canCancel:
            hasOpenCash &&
            canCancelPermission &&
            !isTerminal,

        canModifyAnything:
            hasOpenCash &&
            !isTerminal,
    };
};

export const getAllowedOrderStatuses = ({
    originalStatus,
    canCancel,
    allowAllStatuses = false,
}) => {
    if (allowAllStatuses) {
        return Object.values(ORDER_STATUS);
    }

    const transitions = {
        [ORDER_STATUS.PENDING]: [
            ORDER_STATUS.PREPARING,
            ORDER_STATUS.FINISHED,
        ],

        [ORDER_STATUS.PREPARING]: [
            ORDER_STATUS.SHIPPING,
            ORDER_STATUS.FINISHED,
        ],

        [ORDER_STATUS.SHIPPING]: [
            ORDER_STATUS.FINISHED,
        ],

        [ORDER_STATUS.FINISHED]: [],
        [ORDER_STATUS.CANCELLED]: [],
    };

    const result = [
        originalStatus,
        ...(transitions[originalStatus] || []),
    ];

    if (
        canCancel &&
        !isTerminalOrderStatus(originalStatus)
    ) {
        result.push(ORDER_STATUS.CANCELLED);
    }

    return [...new Set(result)];
};
