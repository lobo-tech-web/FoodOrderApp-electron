import { apiWithToken } from "./axiosConfig.js";

const routerURL = "/main-route-totem";

export const configureTotemCashRegisterService = async (deviceId, cashRegisterId) => {
    const response = await apiWithToken.post(
        `${routerURL}/devices/${encodeURIComponent(deviceId)}/cash-register`,
        { cashRegisterId }
    );
    return response.data;
};

export const configureTotemPointService = async (deviceId, pointTerminalId) => {
    const response = await apiWithToken.post(`${routerURL}/devices/${encodeURIComponent(deviceId)}/point`, { pointTerminalId });
    return response.data;
};

export const getTotemDevicesService = async () => {
    const response = await apiWithToken.get(`${routerURL}/devices`);
    return response.data;
};

export const registerTotemDeviceService = async (data) => {
    const response = await apiWithToken.post(
        `${routerURL}/devices`,
        data
    );

    return response.data;
};

export const changeTotemAccessService = async (deviceId, action) => {
    const endpoint = action === "PAIR" ? "pairing" : "disable";

    const response = await apiWithToken.post(
        `${routerURL}/devices/${encodeURIComponent(deviceId)}/${endpoint}`
    );

    return response.data;
};
