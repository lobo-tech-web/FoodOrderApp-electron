import { api } from "./axiosConfig";

// ---- URLS ----
const apiMainURLContactForm = import.meta.env.VITE_API_CONTACT_FORM_MAIN_ROUTER;
// --------------

export const sendContactFormServices = async (formData) => {
    try {
        const result = await api.post(apiMainURLContactForm, formData);
        return result.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};