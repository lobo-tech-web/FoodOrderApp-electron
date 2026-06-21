const getRelationData = (option) => {
    return option?.ProductCustomOption || option?.productCustomOption || {};
};

export const getProductOptionsForUI = (product) => {
    if (
        Array.isArray(product?.productCustomOptions) &&
        product.productCustomOptions.length > 0
    ) {
        return product.productCustomOptions.map((option) => {
            const relation = getRelationData(option);

            const minSelected = Number(relation.minSelected ?? 0);
            const maxSelected = Number(relation.maxSelected ?? 1);
            const required = Boolean(relation.required ?? false);

            const selectionLimitEnabled =
                required ||
                minSelected > 0 ||
                maxSelected > 1;

            return {
                id: option.id,
                key: option.id,
                name: option.name,
                type: option.type,
                priority: relation.priority ?? option.priority ?? 10,
                required,
                minSelected,
                maxSelected,
                selectionLimitEnabled,
                status: option.status ?? true,
                items: option.items || [],
                source: 'productCustomOptions',
            };
        });
    }

    return (product?.customOptions || []).map((option) => ({
        id: option.id || option.name,
        key: option.id || option.name,
        name: option.name,
        type: option.type,
        priority: option.priority ?? 10,
        required: option.type === 'unique',
        minSelected: option.type === 'unique' ? 1 : 0,
        maxSelected: option.type === 'unique' ? 1 : 999,
        selectionLimitEnabled: option.type === 'unique',
        status: option.status ?? true,
        items: option.items || [],
        source: 'customOptions',
    }));
};

export const getOptionKey = (option) => option.key || option.id || option.name;

export const getSelectedOptionItems = (productOptions, customizations) => {
    return [...(productOptions || [])]
        .filter((option) => option.status !== false)
        .sort((a, b) => {
            const priorityA = Number(a.priority ?? 10);
            const priorityB = Number(b.priority ?? 10);

            if (priorityA !== priorityB) return priorityA - priorityB;

            return String(a.name || '').localeCompare(String(b.name || ''));
        })
        .reduce((acc, option) => {
            const optionKey = getOptionKey(option);
            const selectedMap = customizations[optionKey] || {};

            const selectedItems = [...(option.items || [])]
                .filter((item) => item.status !== false)
                .sort((a, b) => {
                    const priorityA = Number(a.priority ?? 10);
                    const priorityB = Number(b.priority ?? 10);

                    if (priorityA !== priorityB) return priorityA - priorityB;

                    return String(a.name || '').localeCompare(String(b.name || ''));
                })
                .filter((item) => Number(selectedMap[item.id || item.name]) > 0)
                .map((item) => ({
                    optionId: option.id,
                    optionName: option.name,
                    optionType: option.type,
                    optionPriority: Number(option.priority ?? 10),
                    itemId: item.id,
                    itemPriority: Number(item.priority ?? 10),
                    name: item.name,
                    extraCost: Number(item.extraCost || 0),
                    quantity: Number(selectedMap[item.id || item.name]) || 1,
                    source: option.source,
                }));

            return acc.concat(selectedItems);
        }, []);
};

export const getMissingRequiredOptions = (productOptions = [], customizations) => {
    return productOptions
        .filter((option) => option.status !== false)
        .filter((option) => {
            const minSelected = Number(option.minSelected ?? 0);
            return option.required || minSelected > 0 || option.type === 'unique';
        })
        .filter((option) => {
            const optionKey = getOptionKey(option);
            const selectedMap = customizations[optionKey] || {};

            const totalSelected = Object.values(selectedMap).reduce(
                (sum, value) => sum + Number(value || 0),
                0
            );

            const requiredMin = Number(option.minSelected || 1);

            return totalSelected < requiredMin;
        })
        .map((option) => option.name);
};

export const isSelectionLimitEnabled = (option) => {
    return (
        Boolean(option.selectionLimitEnabled) ||
        Boolean(option.required) ||
        Number(option.minSelected || 0) > 0 ||
        Number(option.maxSelected || 0) > 1 ||
        option.type === 'unique'
    );
};

export const getExceededMaxOptions = (productOptions = [], customizations) => {
    return productOptions
        .filter((option) => option.status !== false)
        .filter((option) => isSelectionLimitEnabled(option))
        .filter((option) => {
            if (option.type === 'unique') return false;

            const maxSelected = Number(option.maxSelected || 0);

            if (!maxSelected || maxSelected <= 0) return false;

            const optionKey = getOptionKey(option);
            const selectedMap = customizations[optionKey] || {};

            const totalSelected = Object.values(selectedMap).reduce(
                (sum, value) => sum + Number(value || 0),
                0
            );

            return totalSelected > maxSelected;
        })
        .map((option) => option.name);
};