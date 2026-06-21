export const initialUpdateOrderState = {
    id: '',
    restaurantId: '',
    restaurantName: '',
    tableid: '',
    cartItems: [],
    totalRewardPoints: 0,
    totalRedeemPoints: 0,
    deliverycost: 0,
    servicetax: 0,
    discount: 0,
    discountamount: 0,
    totalAmount: 0,
    paymentMethod: '',
    clientEmail: '',
    clientName: '',
    deliveryAddress: '',
    contactPhone: '',
    orderType: '',
    comentary: '',
    status: '',
    orderDate: {},
    extraPoints: 0,
    riderId: undefined,
    rider: null,
};

export const initialCreateOrderState = {
    userId: '',
    restaurantId: '',
    restaurantName: '',
    tableid: '',
    cartItems: [],
    totalRewardPoints: 0,
    totalRedeemPoints: 0,
    deliverycost: 0,
    servicetax: 0,
    totalAmount: 0,
    discount: 0,
    discountamount: 0,
    paymentMethod: '',
    clientEmail: '',
    clientName: '',
    deliveryAddress: '',
    contactPhone: '',
    orderType: '',
    comentary: '',
    status: '',
    extraPoints: 0,
};

export const normalizeOrderForCompare = (orderData) => {
    if (!orderData) return null;

    return {
        id: orderData.id || '',
        tableid: orderData.tableid || '',
        cartItems: (orderData.cartItems || []).map((item) => ({
            id: item.id || '',
            productId: item.productId || item.id || '',
            name: item.name || '',
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 0,
            customOptions: (item.customOptions || []).map((opt) => ({
                id: opt.id || '',
                name: opt.name || '',
                quantity: Number(opt.quantity) || 0,
                extraCost: Number(opt.extraCost) || 0,
            })),
            productComment: item.productComment || '',
        })),

        deliverycost: Number(orderData.deliverycost) || 0,
        servicetax: Number(orderData.servicetax) || 0,

        // Si querés detectar cambios de descuento por porcentaje:
        discount: Number(orderData.discount) || 0,

        // Si usás descuento por monto, NO lo omitas:
        discountamount: Number(orderData.discountamount) || 0,

        paymentMethod: orderData.paymentMethod || '',
        clientEmail: orderData.clientEmail || '',
        clientName: orderData.clientName || '',
        deliveryAddress: orderData.deliveryAddress || '',
        contactPhone: orderData.contactPhone || '',
        orderType: orderData.orderType || '',
        comentary: orderData.comentary || '',
        status: orderData.status || '',
        extraPoints: Number(orderData.extraPoints) || 0,
        riderId: orderData.riderId || undefined,
    };
};