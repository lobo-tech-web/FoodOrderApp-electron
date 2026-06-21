import { api, apiWithToken } from "./axiosConfig";

// URLS ------->
const apiMainURLCategory = import.meta.env.VITE_API_CATEGORY_MAIN_ROUTER;
// const apiGetIDURLCategory = import.meta.env.VITE_API_CATEGORY_ID_ROUTER;
const apiPutURLCategory = import.meta.env.VITE_API_CATEGORY_PUT_ROUTER;
const apiPutPositionURLCategory = import.meta.env.VITE_API_CATEGORY_PUT_POSITION_ROUTER;
const apiPostURLCategory = import.meta.env.VITE_API_CATEGORY_POST_ROUTER;
const apiDeleteURLCategory = import.meta.env.VITE_API_CATEGORY_DELETE_ROUTER;
// <------------

export const getAllCategoryServices = async (userId, name) => {
    try {
        if (name) {
            const response = await api.get(`${apiMainURLCategory}?name=${name}&userID=${userId}`);
            return await response.data;
        } else {
            const response = await api.get(`${apiMainURLCategory}?userId=${userId}`);
            return await response.data;
        }
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const getCategoryByIDServices = async (categoryID) => {
    try {
        const response = await api.get(`${apiMainURLCategory}/${categoryID}`);
        return await response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const updateCategoryServices = async (categoryData) => {
    try {
        const response = await apiWithToken.put(apiPutURLCategory, { categoryData });
        return await response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const updateCategoryPositionServices = async (userId, categories) => {
    try {
        const response = await apiWithToken.put(apiPutPositionURLCategory, { userId, categories });
        return await response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const addNewCategoryServices = async (categoryData) => {
    try {
        const response = await apiWithToken.post(apiPostURLCategory, { categoryData });
        return await response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

// ELIMINAR USUARIO
export const deleteCategoryService = async (categoryData) => {
    try {
        const response = await apiWithToken.delete(apiDeleteURLCategory, { data: categoryData });
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