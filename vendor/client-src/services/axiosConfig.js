import axios from "axios";

const mainURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: mainURL,
})

export const apiWithToken = axios.create({
    baseURL: mainURL,
});

// DECODIFICADOR DE JWT
import { jwtDecode } from 'jwt-decode';
// FUNCIÓN PARA VERIFICAR EL TOKEN DEL USUARIO SI A EXPIRADO
const isTokenExpired = () => {
    const token = window.localStorage.getItem("token");
    if (!token) return true; // Si no hay token, consideramos que ha expirado

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 < Date.now(); // Si la fecha de expiración es menor que la actual, ha expirado
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return true;
    }
};
// --------------------

// Interceptor para agregar el token a las solicitudes
apiWithToken.interceptors.request.use(
    (config) => {
        if (isTokenExpired()) {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user');
            window.location.href = '/';
            return Promise.reject(new Error("Sesión expirada, por favor inicie sesión nuevamente"));
        }

        const token = window.localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas de error
apiWithToken.interceptors.response.use(
    (response) => response,  // Respuesta exitosa

    async (error) => {
        const { config, response } = error;

        if ((response?.status === 401 || response?.status === 403) && !config._retry) {
            // Si el token ha expirado o es inválido
            config._retry = true; // Evita bucles infinitos

            // Cerrar sesión y redirigir a la página principal
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user');
            window.location.href = '/';  // Redirige a la página principal

            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);