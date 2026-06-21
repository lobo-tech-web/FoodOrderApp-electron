export const initialUpdateProductState = {
    id: '',
    name: '',
    specialTitle: '',
    price: '',
    image: '',
    description: '',
    discount: 0,
    rewardPoints: 0,
    redeemPoints: 0,
    category: '',
    categoryId: '',
    userId: '',
    isSinTacc: false,
    isVeggie: false,
    status: false,
    allowComment: true,
    customOptions: [],
    productCustomOptions: [],
};

export const initialCreateProductState = {
    name: '',
    specialTitle: '',
    price: '',
    image: '',
    description: '',
    discount: 0,
    rewardPoints: 0,
    redeemPoints: 0,
    category: '',
    categoryId: '',
    userId: '',
    isSinTacc: false,
    isVeggie: false,
    status: false,
    allowComment: true,
    customOptions: [],
    productCustomOptions: [],
};

// Para ordenar las Cards por el producto con special title como primeros a mostrar
export const hasSpecialTitle = (product) =>
    typeof product.specialTitle === 'string' &&
    product.specialTitle.trim().length > 0;

// Función para validar entrada numérica
const isValidNumericInput = (value) => {
    // Permite números, un punto decimal y string vacío
    const numericRegex = /^(\d*\.?\d*)$/
    return numericRegex.test(value) || value === ""
}

// Función para validar solo números enteros
const isValidInteger = (value) => {
    const integerRegex = /^\d*$/
    return integerRegex.test(value) || value === ""
}

// Función para formatear valores numéricos
const formatNumericValue = (value, allowDecimals = true) => {
    if (value === "") return ""

    // Remover caracteres no válidos
    let cleanValue = value.toString().replace(/[^\d.]/g, "")

    if (!allowDecimals) {
        // Solo números enteros
        cleanValue = cleanValue.replace(/\./g, "")
    } else {
        // Solo un punto decimal
        const parts = cleanValue.split(".")
        if (parts.length > 2) {
            cleanValue = parts[0] + "." + parts.slice(1).join("")
        }
    }

    return cleanValue
}

// Configuración de campos numéricos
const numericFieldsConfig = {
    // Campos que permiten decimales
    price: { allowDecimals: true, min: 0 },
    extraCost: { allowDecimals: true, min: 0 },

    // Campos que solo permiten enteros
    discount: { allowDecimals: false, min: 0, max: 100 },
    rewardPoints: { allowDecimals: false, min: 0 },
    redeemPoints: { allowDecimals: false, min: 0 },
    priority: { allowDecimals: false, min: 1 },
}



export const updateField = (setState, field, value) => {
    setState((prev) => ({
        ...prev,
        [field]: value,
    }));
};

export const handleInputChange = (setState, { target: { name, value, checked, type } }) => {
    // Si es checkbox, usar el valor checked
    if (type === "checkbox") {
        updateField(setState, name, checked)
        return
    }

    // Si es un campo numérico, aplicar validación
    if (numericFieldsConfig[name]) {
        const config = numericFieldsConfig[name]

        // Validar entrada
        const isValid = config.allowDecimals ? isValidNumericInput(value) : isValidInteger(value)

        if (!isValid) return;

        // Formatear valor
        const formattedValue = formatNumericValue(value, config.allowDecimals)

        // Validar rango si está definido
        if (formattedValue !== "" && !isNaN(formattedValue)) {
            const numValue = Number.parseFloat(formattedValue)

            if (config.min !== undefined && numValue < config.min) return

            if (config.max !== undefined && numValue > config.max) return
        }

        updateField(setState, name, formattedValue)
        return
    }

    // Para campos no numéricos, usar el valor directamente
    updateField(setState, name, value)
}