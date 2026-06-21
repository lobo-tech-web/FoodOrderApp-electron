import Decimal from 'decimal.js';

// Limpia el valor de dinero (elimina símbolos, espacios, etc.)
export const cleanMoneyValue = (money) => {
    if (money === null || money === undefined) return new Decimal(0);
    if (money instanceof Decimal) return money;

    const cleaned = money.toString().replace(/[$,\s]/g, '');
    return new Decimal(cleaned || 0);
}

// Da formato a un número como moneda ARS
export const formatCurrency = (value) => {
    const decimal = value instanceof Decimal ? value : new Decimal(value || 0);

    return decimal.toNumber().toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

const isSelectedCustomOptionItem = (option) => {
    return (
        option &&
        !Array.isArray(option.items) &&
        (
            option.extraCost !== undefined ||
            option.quantity !== undefined ||
            option.itemId !== undefined ||
            option.optionId !== undefined
        )
    );
};

export const getSelectedCustomOptionsForOrder = (product) => {
    const customOptions = product?.customOptions || [];

    if (!Array.isArray(customOptions)) return [];

    return customOptions.flatMap((option) => {
        // Formato nuevo o snapshot viejo plano
        if (isSelectedCustomOptionItem(option)) {
            return [
                {
                    optionId: option.optionId || null,
                    optionName: option.optionName || '',
                    itemId: option.itemId || null,
                    name: option.name || '',
                    extraCost: cleanMoneyValue(option.extraCost).toNumber(),
                    quantity: Number(option.quantity || 1),
                    source: option.source || 'customOptions',
                },
            ];
        }

        // Si por error llega una definición completa con items,
        // no podemos saber qué items eligió el usuario, así que no sumamos nada.
        // Esto evita duplicar extras o sumar todos los items.
        return [];
    });
};

// Suma las customOptions del producto para despues asignarlo en el product.price
export const calculateFinalProductPrice = (product) => {

    const selectedOptions = getSelectedCustomOptionsForOrder(product);

    const customOptionsCost = selectedOptions.reduce((sum, option) => {
        const extraCost = cleanMoneyValue(option.extraCost);
        const quantity = new Decimal(Number(option.quantity || 1));

        return sum.add(extraCost.mul(quantity));
    }, new Decimal(0));

    const basePrice = cleanMoneyValue(product?.price);
    return basePrice.add(customOptionsCost).toNumber();
};

// Calcula subtotales de productos, puntos de recompensa y puntos redimidos
export const calculateProductTotals = (cartItems = []) => {
    let subtotalProducts = new Decimal(0);
    let totalRewardPoints = 0;
    let totalRedeemPoints = 0;

    cartItems.forEach((item) => {
        const itemPrice = new Decimal(item.price || 0);
        const quantity = new Decimal(item.quantity || 0);
        const itemTotal = itemPrice.mul(quantity);

        subtotalProducts = subtotalProducts.add(itemTotal);
        totalRewardPoints += Number(item.rewardPoints || 0) * Number(item.quantity || 0);
        totalRedeemPoints += Number(item.redeemPoints || 0) * Number(item.quantity || 0);
    });

    return {
        subtotalProducts: subtotalProducts.toNumber(),
        totalRewardPoints,
        totalRedeemPoints,
    };
}

// Calcula el descuento según el porcentaje
export const calculateDiscount = (subtotalProducts, discountPercentage) => {
    const discount = new Decimal(discountPercentage || 0);
    const subtotal = cleanMoneyValue(subtotalProducts);

    if (discount.lte(0) || discount.gt(100)) {
        return {
            discountamount: 0,
            discountPercentage: 0,
        };
    }

    const discountAmount = subtotal.mul(discount).div(100);

    return {
        discountamount: discountAmount.toNumber(),
        discountPercentage: discount.toNumber(),
    };
}

// Calcula el total final sumando impuestos y delivery, y restando descuentos
export const calculateFinalTotal = (subtotalProducts, discountAmount, serviceTax, deliveryCost) => {
    const subtotal = cleanMoneyValue(subtotalProducts);
    const discount = cleanMoneyValue(discountAmount);
    const service = cleanMoneyValue(serviceTax);
    const delivery = cleanMoneyValue(deliveryCost);

    const subtotalWithDiscount = subtotal.sub(discount);
    const finalTotal = subtotalWithDiscount.add(service).add(delivery);

    return finalTotal.toNumber();
}