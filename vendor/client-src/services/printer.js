import { api } from "./axiosConfig";

// ---- URLS ----
const apiMainURLReceipt = import.meta.env.VITE_API_SEND_PRINTERS_RECEIPT_ROUTER;
const apiMainURLKitchen = import.meta.env.VITE_API_SEND_PRINTERS_KITCHEN_ROUTER;
// --------------

export const postReceiptServices = async (printerConfig, orderData) => {
    try {
        const result = await api.post(apiMainURLReceipt, { printerConfig, orderData }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return result.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const postKitchenServices = async (printerConfig, orderData) => {
    try {
        const result = await api.post(apiMainURLKitchen, { printerConfig, orderData }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return result.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};