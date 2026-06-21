import { useMemo } from "react"

// ---- UTILS ----
import { getOptionKey } from "@/utils/migrateCustomOptions.js"
// ---------------

export const usePriceCalculation = (product, customizations, productOptions = []) => {
    // FUNCIÓN PARA CALCULAR EL PRECIO SUMANDO EL PRODUCTO Y SUS CUSTOM OPTIONS
    const totalPrice = useMemo(() => {
        let total = Number(product?.price || 0);

        productOptions.forEach((option) => {
            const optionKey = getOptionKey(option);
            const selectedMap = customizations[optionKey] || {};

            (option.items || []).forEach((item) => {
                const itemKey = item.id || item.name;
                const itemQuantity = Number(selectedMap[itemKey] || 0);
                const extraCost = Number(item.extraCost || 0);

                total += extraCost * itemQuantity;
            });
        });

        return total;
    }, [product?.price, customizations, productOptions]);

    const formattedTotalPrice = useMemo(() => {
        return totalPrice.toLocaleString('es-AR');
    }, [totalPrice]);

    return {
        totalPrice,
        formattedTotalPrice,
        calculateTotalPrice: formattedTotalPrice,
    }
}
