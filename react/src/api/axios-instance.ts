import axios from 'axios';
import keycloak from "../auth/keycloak.ts";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

// Request Interceptor

api.interceptors.request.use(async (config) => {
    try {
        await keycloak.updateToken(30);
    } catch (error) {
        console.error("Failed to update token", error);
        void keycloak.login();
    }

    if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
    }

    return config
})

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            void keycloak.login();
        }
        return Promise.reject(error);
    }

)