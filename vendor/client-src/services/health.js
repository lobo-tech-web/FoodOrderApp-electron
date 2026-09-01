import { api } from "./axiosConfig";

export const checkBackendHealthService = async () => {
  try {
    const response = await api.get("/health", {
      timeout: 6000,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data?.message ||
          "El backend responde pero la base de datos no esta disponible",
      };
    }

    throw {
      message:
        error.message ||
        "No se pudo conectar con el backend o la base de datos",
    };
  }
};
