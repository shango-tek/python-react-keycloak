import {useEffect, useMemo} from "react";
import axios, {AxiosInstance, AxiosRequestHeaders} from "axios";
import keycloak from "../auth/keycloak.ts";
import Cookies from "js-cookie";

const TOKEN_REFRESH_BUFFER_SECONDS = 30;

export function useAxios(): AxiosInstance {
    const instance = useMemo(
        () => axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": getCsrfToken(),
                "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
            }
        }),
        []
    );

    useEffect(() => {
        const requestInterceptor = instance.interceptors.request.use(
            async (config) => {

                config.headers = (config.headers ?? {}) as AxiosRequestHeaders;

                try {
                    await keycloak.updateToken(TOKEN_REFRESH_BUFFER_SECONDS);
                } catch (err) {
                    console.error("Token refresh failed — redirecting to login", err);
                    await keycloak.login();
                    return Promise.reject(new Error("Session expired. Redirecting to login."));
                }
                if (keycloak.token) {
                    config.headers.Authorization = `Bearer ${keycloak.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            instance.interceptors.request.eject(requestInterceptor);
        };
    }, [instance]);

    return instance;
}

function getCsrfToken(): string {
    return Cookies.get("XSRF-TOKEN") ?? "";
}