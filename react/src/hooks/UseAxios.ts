/**
 * useAxios — authenticated Axios hook
 *
 * Creates a stable Axios instance (via useMemo) whose request interceptor
 * automatically refreshes the Keycloak token before each request and attaches
 * the Bearer header.  The instance is memoised so the same object is returned
 * on every render, avoiding infinite-loop re-subscriptions.
 *
 * Usage:
 *   const api = useAxios();
 *   const { data } = await api.get("/books");
 */

import { useEffect, useMemo } from "react";
import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import keycloak from "../auth/keycloak.ts";

/** Refresh the token if it expires within this many seconds. */
const TOKEN_REFRESH_BUFFER_SECONDS = 30;

export function useAxios(): AxiosInstance {
  // ── Stable instance ───────────────────────────────────────────────────────
  // VITE_API_URL is baked in at build time by Vite — it must be defined in
  // react/.env (local dev) and passed as a build arg in docker-compose.yml.
  const instance = useMemo(
    () =>
      axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    [],
  );

  // ── Request interceptor ───────────────────────────────────────────────────
  useEffect(() => {
    const id = instance.interceptors.request.use(
      async (config) => {
        config.headers = (config.headers ?? {}) as AxiosRequestHeaders;

        // Try to silently refresh the Keycloak token before the request.
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
      (error) => Promise.reject(error),
    );

    // Clean up interceptor when the component that owns this hook unmounts.
    return () => instance.interceptors.request.eject(id);
  }, [instance]);

  return instance;
}
