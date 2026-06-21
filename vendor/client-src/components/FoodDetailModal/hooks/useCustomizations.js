import { useState, useCallback } from "react";

import { isSelectionLimitEnabled } from "@/utils/migrateCustomOptions.js";

const getOptionTotalSelected = (optionValues = {}) => {
    return Object.values(optionValues).reduce((sum, value) => {
        return sum + Number(value || 0);
    }, 0);
};

export const useCustomizations = (showAlert, theme) => {
    const [customizations, setCustomizations] = useState({});

    const handleCustomizationChange = useCallback(
        (optionKey, itemKey, value, option) => {
            setCustomizations((prev) => {
                const newCustomizations = {
                    ...prev,
                    [optionKey]: {
                        ...(prev[optionKey] || {}),
                    },
                };

                if (option.type === "unique") {
                    newCustomizations[optionKey] = {
                        [itemKey]: value ? 1 : 0,
                    };

                    return newCustomizations;
                }

                if (option.type === "checkbox") {
                    const checked = Boolean(value);

                    const nextOptionValues = {
                        ...newCustomizations[optionKey],
                        [itemKey]: checked ? 1 : 0,
                    };

                    const limitEnabled = isSelectionLimitEnabled(option);
                    const maxSelected = Number(option.maxSelected || 0);

                    if (checked && limitEnabled && maxSelected > 0) {
                        const optionTotal = getOptionTotalSelected(nextOptionValues);

                        if (optionTotal > maxSelected) {
                            showAlert(
                                `No puedes seleccionar más de ${maxSelected} opción(es) en ${option.name}`,
                                'warning',
                                theme
                            );

                            return prev;
                        }
                    }

                    newCustomizations[optionKey] = nextOptionValues;

                    return newCustomizations;
                }

                if (option.type === "extra") {
                    const newValue = Math.max(0, Number(value || 0));

                    const nextOptionValues = {
                        ...newCustomizations[optionKey],
                        [itemKey]: newValue,
                    };

                    const limitEnabled = isSelectionLimitEnabled(option);
                    const maxSelected = Number(option.maxSelected || 0);

                    if (limitEnabled && maxSelected > 0) {
                        const optionTotal = getOptionTotalSelected(nextOptionValues);

                        if (optionTotal > maxSelected) {
                            showAlert(
                                `No puedes seleccionar más de ${maxSelected} unidad(es) en ${option.name}`,
                                'warning',
                                theme
                            );

                            return prev;
                        }
                    }

                    newCustomizations[optionKey] = nextOptionValues;

                    return newCustomizations;
                }

                return newCustomizations;
            });
        },
        [showAlert, theme]
    );

    return {
        customizations,
        handleCustomizationChange,
        setCustomizations,
    };
};
