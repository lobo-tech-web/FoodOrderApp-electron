export const ACTION_LABELS = {
    CREATE: "Pedido creado",
    UPDATE: "Pedido modificado",
    STATUS_CHANGE: "Estado modificado",
    PAYMENT_CHANGE: "Pago modificado",
    CANCEL: "Pedido cancelado",
    ITEM_ADD: 'Producto agregado',
    ITEM_REMOVE: 'Producto eliminado',
    DISCOUNT: 'Descuento modificado',
    REFUND: 'Reintegro',
    PRINT: 'Pedido impreso',
    REPRINT: 'Pedido reimpreso',
};

export const ACTION_SHORT_LABELS = {
    CREATE: "Creación",
    UPDATE: "Modificación",
    STATUS_CHANGE: "Estado",
    PAYMENT_CHANGE: "Pago",
    CANCEL: "Cancelación",
    ITEM_ADD: "Producto agregado",
    ITEM_REMOVE: "Producto eliminado",
    DISCOUNT: "Descuento",
    REFUND: "Reintegro",
    PRINT: "Impresión",
    REPRINT: "Reimpresión",
};

export const ACTION_COLORS = {
    CREATE: "success",
    UPDATE: "info",
    STATUS_CHANGE: "primary",
    PAYMENT_CHANGE: "warning",
    CANCEL: "error",
    ITEM_ADD: "success",
    ITEM_REMOVE: "warning",
    DISCOUNT: "secondary",
    REFUND: "error",
    PRINT: "default",
    REPRINT: "default",
};

export const FIELD_LABELS = {
    status: "Estado",
    clientName: "Cliente",
    clientEmail: "Email",
    contactPhone: "Teléfono",
    deliveryAddress: "Dirección",
    orderType: "Entrega",
    paymentMethod: "Método de pago",
    isPaid: "Estado de pago",
    paidAt: "Fecha de pago",
    deliverycost: "Costo de delivery",
    servicetax: "Servicio",
    discount: "Descuento",
    discountamount: "Monto descuento",
    extraPoints: "Puntos adicionales",
    riderId: "Cadete",
    comentary: "Comentario",
    cartItems: "Productos",
    totalAmount: "Total",
    totalRewardPoints: "Puntos otorgados",
    totalRedeemPoints: "Puntos canjeados",
};

export const AUDIT_VISIBLE_FIELDS = [
    "status",
    "clientName",
    "clientEmail",
    "contactPhone",
    "deliveryAddress",
    "orderType",
    "paymentMethod",
    "isPaid",
    "paidAt",
    "cartItems",
    "deliverycost",
    "servicetax",
    "discount",
    "discountamount",
    "extraPoints",
    "riderId",
    "comentary",
    "totalAmount",
    "totalRewardPoints",
    "totalRedeemPoints",
];

export const NUMERIC_AUDIT_FIELDS = new Set([
    "deliverycost",
    "servicetax",
    "discount",
    "discountamount",
    "totalAmount",
    "totalRewardPoints",
    "totalRedeemPoints",
    "extraPoints",
]);

export const MONEY_AUDIT_FIELDS = new Set([
    "deliverycost",
    "servicetax",
    "discountamount",
    "totalAmount",
]);

export const POINTS_AUDIT_FIELDS = new Set([
    "totalRewardPoints",
    "totalRedeemPoints",
    "extraPoints",
]);

export const parseAuditNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    const normalized = String(value)
        .trim()
        .replace(/\$/g, "")
        .replace(/\s+/g, "")
        .replace(/,/g, "");

    if (!normalized) {
        return null;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
};

export const areAuditValuesEqual = (field, beforeValue, afterValue) => {
    if (NUMERIC_AUDIT_FIELDS.has(field)) {
        const beforeNumber = parseAuditNumber(beforeValue);

        const afterNumber = parseAuditNumber(afterValue);

        if (beforeNumber !== null && afterNumber !== null) {
            return beforeNumber === afterNumber;
        }
    }

    return JSON.stringify(beforeValue) === JSON.stringify(afterValue);
};

export const parseData = (value) => {
    if (!value) return {};

    if (typeof value === "object") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return {};
    }
};

export const moneyFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

export const formatValue = (field, value) => {
    if (field === "cartItems" && Array.isArray(value)) {
        if (value.length === 0) {
            return "Sin productos";
        }

        return value
            .map((item) => {
                const quantity = Number(item?.quantity || 1);
                const name = item?.name || "Producto";
                return `${quantity}x ${name}`;
            }).join(" · ");
    }

    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (field === "isPaid") {
        return value === true ||
            value === "true"
            ? "PAGADO"
            : "PENDIENTE";
    }

    if (field === "paidAt") {
        return value
            ? formatDate(value)
            : "-";
    }

    if (NUMERIC_AUDIT_FIELDS.has(field)) {
        const numericValue = parseAuditNumber(value);

        if (numericValue !== null) {
            if (MONEY_AUDIT_FIELDS.has(field)) {
                return moneyFormatter.format(numericValue);
            }

            if (field === "discount") {
                return `${numericValue}%`;
            }

            if (POINTS_AUDIT_FIELDS.has(field)) {
                return String(numericValue);
            }

            return String(numericValue);
        }
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

export const getChanges = (log) => {
    const before = parseData(log.beforeData);
    const after = parseData(log.afterData);

    if (log.action === "CREATE") {
        return [];
    }

    return AUDIT_VISIBLE_FIELDS.filter((field) => {
        return !areAuditValuesEqual(field, before?.[field], after?.[field]);
    }).map((field) => ({
        field,
        label: FIELD_LABELS[field] || field,
        beforeValue: before?.[field],
        afterValue: after?.[field],
        before: formatValue(field, before?.[field]),
        after: formatValue(field, after?.[field]),
    }));
};

export const formatDate = (date) => {
    if (!date) return '-';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    const parts =
        new Intl.DateTimeFormat(
            'es-AR',
            {
                timeZone: 'America/Argentina/Buenos_Aires',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }
        ).formatToParts(parsedDate);

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value])
    );

    return (
        `${values.day}-${values.month}-${values.year}` +
        ` · ${values.hour}:${values.minute}`
    );
};

export const getArgentinaToday = () => {
    const parts = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone:
                "America/Argentina/Buenos_Aires",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }
    ).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map((part) => [
            part.type,
            part.value,
        ])
    );

    return [
        values.year,
        values.month,
        values.day,
    ].join("-");
};