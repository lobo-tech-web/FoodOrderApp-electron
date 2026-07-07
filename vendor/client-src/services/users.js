import { api, apiWithToken } from "./axiosConfig";

// URLS --------->
const apiMainURLUsers = import.meta.env.VITE_API_USERS_MAIN_ROUTER;
const apiGetClientsURLUsers = import.meta.env.VITE_API_GET_USERS_CLIENTS_ROUTER;
const apiPutURLUsers = import.meta.env.VITE_API_USERS_PUT_ROUTER;
const apiPutPassURLUsers = import.meta.env.VITE_API_USERS_PUT_PASS_ROUTER;
const apiPutAdminPassURLUsers = import.meta.env.VITE_API_USERS_PUT_PASS_ADMIN_ROUTER;
const apiRegURLUsers = import.meta.env.VITE_API_USERS_POST_REGISTER_ROUTER;
const apiLoginURLUsers = import.meta.env.VITE_API_USERS_POST_LOGIN_ROUTER;
const apiForgotPasswordURLUsers = import.meta.env.VITE_API_USERS_POST_RESTORE_PASS_ROUTER;
const apiDeleteURLUsers = import.meta.env.VITE_API_USERS_DELETE_ROUTER;
// <--------------

// OBTENER TODOS LOS USUARIOS
export const getAllUsersService = async (name, email) => {
    try {
        const params = {};
        if (name) params.name = name;
        if (email) params.email = email;

        const response = await apiWithToken.get(apiMainURLUsers, { params });
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

export const getAllUsersClientsService = async (restaurantId) => {
    try {
        const response = await apiWithToken.get(`${apiGetClientsURLUsers}?restaurantId=${restaurantId}`);
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

// OBTENER LOS DATOS DEL USUARIO POR ID
export const getUserByID = async (userId) => {
    try {
        const response = await api.get(`${apiMainURLUsers}/${userId}`);
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

// ACTUALIZAR USUARIO
export const updateUserService = async (userData) => {
    try {
        const logoFile =
            userData.businessLogoFile ||
            userData.logoFile ||
            userData.image ||
            null;

        const isFile =
            typeof File !== 'undefined' && logoFile instanceof File;

        if (isFile) {
            const {
                businessLogoFile,
                logoFile: removedLogoFile,
                image,
                ...cleanUserData
            } = userData;

            const formData = new FormData();

            formData.append('userData', JSON.stringify(cleanUserData));
            formData.append('image', logoFile);

            const response = await apiWithToken.put(apiPutURLUsers, formData);

            return response.data;
        }

        const response = await apiWithToken.put(apiPutURLUsers, { userData });
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

// ACTUALIZAR PASS DEL USUARIO
export const updateUserPasswordService = async (userData) => {
    try {
        const response = await apiWithToken.put(apiPutPassURLUsers, { userData });
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

// ACTUALIZAR PASS DE LOS ADMIN
export const updateUserAdminPasswordService = async (userData) => {
    try {
        const response = await apiWithToken.put(apiPutAdminPassURLUsers, { userData });
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

// AGREGAR USUARIO
export const registerUserService = async (userData) => {
    try {
        const response = await api.post(apiRegURLUsers, { userData })
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

// INICIO DE SESIÓN USUARIO
export const userLoginService = async (user) => {
    try {
        const response = await api.post(apiLoginURLUsers, user);
        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 429) {
                throw {
                    status: error.response.status,
                    message: error.response.data.error,
                }
            } else {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || "Error desconocido en la respuesta del servidor",
                };
            }
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

export const forgotPasswordService = async (userData) => {
    try {
        const response = await api.post(apiForgotPasswordURLUsers, userData);
        return response.data;
    } catch (error) {
        if (error.response) {
            return {
                error: true,
                status: error.response.status,
                message: error.response.data.message || "Error desconocido en la respuesta del servidor",
            }
        } else {
            // Si el error no tiene `response` (problemas de red, etc.)
            throw {
                message: error.message || "Error desconocido al intentar conectarse al servidor"
            };
        }
    }
};

// ELIMINAR USUARIO
export const deleteUserService = async (userId) => {
    try {
        const response = await apiWithToken.delete(`${apiDeleteURLUsers}?userId=${userId}`);
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