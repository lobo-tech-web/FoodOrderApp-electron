import { api, apiWithToken } from "./axiosConfig";

// URLS -------->
const apiURLMainProducts = import.meta.env.VITE_API_PRODUCTS_MAIN_ROUTER;
// const apiURLGetIDProducts = import.meta.env.VITE_API_PRODUCTS_ID_ROUTER;
const apiURLPutProducts = import.meta.env.VITE_API_PRODUCTS_PUT_ROUTER;
const apiURLPutProductsPrice = import.meta.env.VITE_API_PRODUCTS_PRICE_PUT_ROUTER;
const apiURLPostProducts = import.meta.env.VITE_API_PRODUCTS_POST_ROUTER;
const apiURLDeleteProducts = import.meta.env.VITE_API_PRODUCTS_DELETE_ROUTER;
// <-------------

// ---- Helpers ----
const PRODUCT_FIELDS_TO_OMIT = new Set([
    'customOptions',
    'productCustomOptions',
    'category',
]);

const appendProductFormData = (formData, productData) => {
    Object.entries(productData).forEach(([key, value]) => {
        if (PRODUCT_FIELDS_TO_OMIT.has(key)) return;
        if (value === undefined) return;
        if (value === null) return;

        formData.append(key, value);
    });
};
// -----------------

// OBTENER TODOS LOS PRODUCTOS
export const getAllProductsService = async (userId, name) => {
    try {
        const queryOption = name ? `?name=${name}&userId=${userId}` : `?userId=${userId}`;
        const response = await api.get(`${apiURLMainProducts}${queryOption}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

// OBTENER PRODUCTO POR ID
export const getProductByIDService = async (productID) => {
    try {
        const response = await apiWithToken.get(`${apiURLMainProducts}/${productID}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

// ACTUALIZAR PRODUCTO
export const updateProductService = async (productData) => {
    try {
        const data = new FormData();
        appendProductFormData(data, productData);

        const response = await apiWithToken.put(apiURLPutProducts, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

// ACTUALIZAR PRECIOS DE PRODUCTOS
export const updateProductsPriceService = async (productDataPrices) => {
    try {
        const response = await apiWithToken.put(apiURLPutProductsPrice, productDataPrices, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
}

// AGREGAR PRODUCTO
export const addProductService = async (productData) => {
    try {
        const data = new FormData();
        appendProductFormData(data, productData);

        const response = await apiWithToken.post(apiURLPostProducts, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

// ELIMINAR PRODUCTO
export const deleteProductService = async (productData) => {
    try {
        const response = await apiWithToken.delete(apiURLDeleteProducts, { data: productData });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            };
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};