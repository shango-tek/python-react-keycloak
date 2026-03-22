import {createContext, createElement, ReactNode, useContext} from "react";
import {AxiosInstance} from "axios";
import {useAxios} from "../hooks/UseAxios.ts";

const ApiContext = createContext<AxiosInstance | null>(null);

export function ApiProvider({children}: { children: ReactNode }) {
    const api = useAxios();
    return createElement(ApiContext.Provider, {value: api}, children);
}

export function useApi(): AxiosInstance {
    const ctx = useContext(ApiContext);
    if (!ctx) throw new Error("useApi must be used inside <ApiProvider>");
    return ctx;
}