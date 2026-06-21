export const normalizeText = (value) => {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

export const getCustomOptionPrintPriority = (option) => {
    return Number(
        option.optionPriority ??
        option.priority ??
        option.ProductCustomOption?.priority ??
        10
    );
};

export const getSortedCustomOptionsForPrint = (customOptions = []) => {
    if (!Array.isArray(customOptions)) return [];

    return [...customOptions].sort((a, b) => {
        const priorityA = getCustomOptionPrintPriority(a);
        const priorityB = getCustomOptionPrintPriority(b);

        if (priorityA !== priorityB) return priorityA - priorityB;

        const itemPriorityA = Number(a.itemPriority ?? 10);
        const itemPriorityB = Number(b.itemPriority ?? 10);

        if (itemPriorityA !== itemPriorityB) return itemPriorityA - itemPriorityB;

        return normalizeText(a.name).localeCompare(normalizeText(b.name));
    });
};

export const getCartItemsForPrint = (cartItems = []) => {
    if (!Array.isArray(cartItems)) return [];

    return cartItems.map((item) => ({
        ...item,
        customOptions: getSortedCustomOptionsForPrint(item.customOptions || []),
    }));
};

export const formatCustomOptionForKitchenPrint = (option) => {
    const itemName = String(option.name || '').toUpperCase();
    const quantity = Number(option.quantity || 1);

    return `${itemName}${quantity > 1 ? ` x${quantity}` : ''}`;
};

export const formatCustomOptionForTicketPrint = (option) => {
    const itemName = String(option.name || '').toUpperCase();
    const quantity = Number(option.quantity || 1);
    const price = Number(option.extraCost || 0);

    return `${itemName}${quantity > 1 ? ` x${quantity}` : ''}${price > 0 ? ` +$${price}` : ''
        }`;
};