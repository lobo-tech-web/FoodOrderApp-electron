export const parseNumber = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    return Number(value) || 0;
};

export const createLocalId = () => {
    return `adj_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getSignedAdjustment = (adjustment) => {
    const amount = Math.abs(parseNumber(adjustment.amount));
    return adjustment.type === 'CHARGE' ? -amount : amount;
};

export const calculateLocalSummary = ({ deliveries = [], form = {} }) => {

    const adjustments = Array.isArray(form.adjustments)
        ? form.adjustments
        : [];

    const cashDeliveries = deliveries.filter((delivery) => {
        const order = delivery.order;

        return (
            order?.status === 'FINALIZADO' && order?.paymentMethod === 'EFECTIVO'
        );
    });

    const cashCollected = cashDeliveries.reduce((total, delivery) => {
        return (
            total + parseNumber(delivery.order?.totalAmount || delivery.orderTotal)
        );
    }, 0);

    const deliveryFeeTotal = deliveries.reduce((total, delivery) => {
        return total + parseNumber(delivery.deliveryCost);
    }, 0);

    const adjustmentsTotal = adjustments.reduce((total, adjustment) => {
        return total + getSignedAdjustment(adjustment);
    }, 0);

    const initialCash = parseNumber(form.initialCash);
    const cashDelivered = parseNumber(form.cashDelivered);

    const riderShouldKeep = deliveryFeeTotal + adjustmentsTotal;
    const expectedCashToAdmin = cashCollected + initialCash - riderShouldKeep;
    const cashDifference = cashDelivered - expectedCashToAdmin;

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
    };
};