export const parseNumber = (value) => {
    if (value === '' || value === null || value === undefined) return 0;

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    const rawValue = String(value)
        .trim()
        .replace(/\$/g, '')
        .replace(/\s/g, '');

    if (!rawValue) return 0;

    let normalizedValue = rawValue;

    const hasComma = normalizedValue.includes(',');
    const hasDot = normalizedValue.includes('.');

    if (hasComma && hasDot) {
        const lastComma = normalizedValue.lastIndexOf(',');
        const lastDot = normalizedValue.lastIndexOf('.');

        normalizedValue =
            lastComma > lastDot
                ? normalizedValue.replace(/\./g, '').replace(',', '.')
                : normalizedValue.replace(/,/g, '');
    } else if (hasComma) {
        normalizedValue = normalizedValue.replace(',', '.');
    }

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const createLocalId = () => {
    return `adj_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getSignedAdjustment = (adjustment) => {
    const amount = Math.abs(parseNumber(adjustment.amount));
    return adjustment.type === 'CHARGE' ? -amount : amount;
};

export const getDeliveryCostForClosure = (delivery) => {
    const deliverySnapshotCost = parseNumber(delivery?.deliveryCost);
    const orderDeliveryCost = parseNumber(delivery?.order?.deliverycost);

    if (deliverySnapshotCost > 0) return deliverySnapshotCost;

    return orderDeliveryCost;
};

export const calculateLocalSummary = ({ deliveries = [], form = {} }) => {
    const adjustments = Array.isArray(form.adjustments)
        ? form.adjustments
        : [];

    const cashDeliveries = deliveries.filter((delivery) => {
        const order = delivery.order;
        return (
            order?.status === 'FINALIZADO' &&
            order?.paymentMethod === 'EFECTIVO'
        );
    });

    const cashCollected = cashDeliveries.reduce((total, delivery) => {
        return (
            total +
            parseNumber(delivery.order?.totalAmount ?? delivery.orderTotal ?? 0)
        );
    }, 0);

    const deliveryFeeTotal = deliveries.reduce((total, delivery) => {
        return total + getDeliveryCostForClosure(delivery);
    }, 0);

    const adjustmentsTotal = adjustments.reduce((total, adjustment) => {
        return total + getSignedAdjustment(adjustment);
    }, 0);

    // Totales
    const initialCash = parseNumber(form.initialCash);
    const cashDelivered = parseNumber(form.cashDelivered);
    const baseRiderPayment = deliveryFeeTotal + adjustmentsTotal;

    const expectedCashToAdmin = cashCollected + initialCash - baseRiderPayment;
    const cashDifference = cashDelivered - expectedCashToAdmin;
    const riderShouldKeep = Math.max(baseRiderPayment + cashDifference, 0);
    const remainingDebt = cashDifference < 0
        ? Math.max(Math.abs(cashDifference) - baseRiderPayment, 0)
        : 0;

    return {
        ordersCount: deliveries.length,
        cashOrdersCount: cashDeliveries.length,
        cashCollected,
        deliveryFeeTotal,
        adjustmentsTotal,
        initialCash,
        cashDelivered,
        riderShouldKeep,
        expectedCashToAdmin,
        cashDifference,
        remainingDebt,
    };
};