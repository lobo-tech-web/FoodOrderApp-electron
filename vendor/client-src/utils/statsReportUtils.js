export const normalizeStatsKey = (value) =>
    value?.toString().toLowerCase().trim() || '';

export const buildCategoryRows = (productsByCategory = {}) =>
    Object.entries(productsByCategory)
        .map(([categoryName, products]) => {
            const totalQuantity = products.reduce(
                (acc, product) => acc + Number(product.quantity || 0),
                0
            );

            const totalAmount = products.reduce(
                (acc, product) => acc + Number(product.totalPrice || 0),
                0
            );

            return {
                categoryName,
                products,
                totalQuantity,
                totalAmount,
            };
        })
        .sort((a, b) => b.totalQuantity - a.totalQuantity);

export const buildCustomOptionCategoryRows = (
    groupedCustomOptionsNormalized = []
) => {
    return groupedCustomOptionsNormalized.map((group) => ({
        key: group.key,
        label: group.label,
        quantity: group.effectiveQuantity ?? group.quantity ?? 0,
        totalCost: group.totalCost ?? 0,
        rows: group.rows || [],
    }));
};

export const buildTopCustomOptionsRows = (groupedCustomOptions = []) => {
    return groupedCustomOptions.map((option) => ({
        name: option.name,
        quantity: option.effectiveQuantity ?? option.quantity ?? 0,
        totalCost: option.totalCost ?? 0,
        optionNames: option.optionNames || [],
        sources: option.sources || [],
    }));
};

export const buildFriesSummary = (groupedCustomOptionsNormalized = []) => {
    const friesGroup = groupedCustomOptionsNormalized.find(
        (group) => group.key === 'fries'
    );

    if (!friesGroup) {
        return {
            quantity: 0,
            totalCost: 0,
            varieties: [],
            rows: [],
        };
    }

    const rows = friesGroup.rows || [];

    return {
        quantity: Number(friesGroup.effectiveQuantity ?? friesGroup.quantity ?? 0),
        totalCost: Number(friesGroup.totalCost || 0),
        varieties: rows.flatMap((row) => row.varieties || []),
        rows,
    };
};

export const buildCustomOptionGroupsForTables = (
    groupedCustomOptionsNormalized = []
) => {
    return groupedCustomOptionsNormalized
        .filter((group) => group.rows?.length > 0)
        .map((group) => ({
            key: group.key,
            label: group.label,
            quantity: group.effectiveQuantity ?? group.quantity ?? 0,
            totalCost: group.totalCost ?? 0,
            rows: group.rows || [],
        }));
};

export const buildDrinkRows = ({
    productsByCategory = {},
    groupedCustomOptionsNormalized = [],
    groupedCustomOptions = [],
}) => {
    const beverageKeywords = [
        'agua',
        'bebida',
        'bebidas',
        'cerveza',
        'coca',
        'coca cola',
        'fanta',
        'gaseosa',
        'imperial',
        'pomelo',
        'schweppes',
        'sprite',
        'lata',
        'birra',
    ];

    const isBeverageName = (value) => {
        const normalizedValue = normalizeStatsKey(value);

        return beverageKeywords.some((keyword) =>
            normalizedValue.includes(keyword)
        );
    };

    const drinksMap = {};

    const addDrink = ({ name, quantity, totalAmount, source }) => {
        const key = normalizeStatsKey(name);
        if (!key) return;

        if (!drinksMap[key]) {
            drinksMap[key] = {
                name,
                quantity: 0,
                totalAmount: 0,
                sources: new Set(),
            };
        }

        drinksMap[key].quantity += Number(quantity || 0);
        drinksMap[key].totalAmount += Number(totalAmount || 0);
        drinksMap[key].sources.add(source);
    };

    Object.entries(productsByCategory).forEach(([categoryName, products]) => {
        const isDrinkCategory = isBeverageName(categoryName);

        products.forEach((product) => {
            if (!isDrinkCategory && !isBeverageName(product.name)) return;

            addDrink({
                name: product.name,
                quantity: product.quantity,
                totalAmount: product.totalPrice,
                source: 'Producto',
            });
        });
    });

    groupedCustomOptionsNormalized
        .filter((group) => ['drinks', 'beers'].includes(group.key))
        .forEach((group) => {
            group.rows?.forEach((row) => {
                addDrink({
                    name: row.name,
                    quantity: row.effectiveQuantity ?? row.quantity,
                    totalAmount: row.totalCost,
                    source: group.label,
                });
            });
        });

    groupedCustomOptions.forEach((option) => {
        if (!isBeverageName(option.name)) return;

        addDrink({
            name: option.name,
            quantity: option.effectiveQuantity ?? option.quantity,
            totalAmount: option.totalCost,
            source: 'Extras',
        });
    });

    return Object.values(drinksMap)
        .map((drink) => ({
            ...drink,
            sourcesLabel: Array.from(drink.sources).join(' + '),
        }))
        .sort((a, b) => b.quantity - a.quantity);
};