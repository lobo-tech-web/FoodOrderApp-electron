import { api } from "./axiosConfig";

// URLS --------->
const apiMainURLDates = import.meta.env.VITE_API_DATES_MAIN_ROUTER;
// <--------------

export const getDateForOrdersServices = async () => {
    try {
        const result = await api.get(apiMainURLDates);
        return result.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};