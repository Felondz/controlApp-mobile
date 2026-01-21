/**
 * API Client for ControlApp Mobile
 * Configured with Axios and authentication token handling
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API base URL from environment (fallback for development)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://controlapp.io/api';

// Token key for secure storage
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';
export const CREDENTIALS_KEY = 'auth_credentials';

// Callback to handle silent login from store (to avoid circular dependency)
let silentLoginCallback: (() => Promise<string | null>) | null = null;
let logoutCallback: (() => void) | null = null;

export const setAuthCallbacks = (
    silentLogin: () => Promise<string | null>,
    logout: () => void
) => {
    silentLoginCallback = silentLogin;
    logoutCallback = logout;
};

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Error getting token from SecureStore:', error);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Response interceptor - handle 401 errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Attempt silent login if callback configurd
            if (silentLoginCallback) {
                try {
                    console.log('Token expired (401), attempting silent login...');
                    const newToken = await silentLoginCallback();

                    if (newToken) {
                        console.log('Silent login successful, retrying request...');
                        // Update header and retry
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Silent login failed:', refreshError);
                }
            }

            // If we get here, silent login failed or wasn't possible
            console.log('Silent login failed or not configured, logging out...');
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            // Don't delete credentials here, let the user decide if they want to clear them on next login screen visit
            // actually, if silent login failed (e.g. password changed), we SHOULD clear them?
            // No, maybe network error. But if auth failed (401 on login), authStore logic will handle it.

            if (logoutCallback) {
                logoutCallback();
            }
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authApi = {
    login: (email: string, password: string, remember_me: boolean, device_name: string) =>
        api.post('/login', { email, password, remember_me, device_name }),

    register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
        api.post('/register', data),

    logout: () =>
        api.post('/logout'),

    getUser: () =>
        api.get('/user'),

    verifyEmail: (id: string, hash: string, expires: string, signature: string) =>
        api.get(`/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`),

    forgotPassword: (email: string) =>
        api.post('/forgot-password', { email }),

    resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
        api.post('/reset-password', data),
};

// Projects API endpoints
export const projectsApi = {
    getAll: () => api.get('/proyectos'),
    getOne: (id: number) => api.get(`/proyectos/${id}`),
    create: (data: any) => api.post('/proyectos', data),
    update: (id: number, data: any) => api.put(`/proyectos/${id}`, data),
    delete: (id: number) => api.delete(`/proyectos/${id}`),
};

// Finance API endpoints
export const financeApi = {
    getAccounts: (projectId: number) => api.get(`/proyectos/${projectId}/cuentas`),
    getTransactions: (projectId: number) => api.get(`/proyectos/${projectId}/transacciones`),
    getBalance: (projectId: number) => api.get(`/proyectos/${projectId}/finance/balance`),
    createTransaction: (projectId: number, data: any) =>
        api.post(`/proyectos/${projectId}/transacciones`, data),
};

// Tasks API endpoints
export const tasksApi = {
    getAll: (projectId: number) => api.get(`/proyectos/${projectId}/tasks`),
    create: (projectId: number, data: any) => api.post(`/proyectos/${projectId}/tasks`, data),
    update: (projectId: number, taskId: number, data: any) =>
        api.put(`/proyectos/${projectId}/tasks/${taskId}`, data),
    delete: (projectId: number, taskId: number) =>
        api.delete(`/proyectos/${projectId}/tasks/${taskId}`),
};

// Inventory API endpoints
export const inventoryApi = {
    getItems: (projectId: number) => api.get(`/proyectos/${projectId}/inventory/items`),
    createItem: (projectId: number, data: any) =>
        api.post(`/proyectos/${projectId}/inventory/items`, data),
    updateItem: (projectId: number, itemId: number, data: any) =>
        api.put(`/proyectos/${projectId}/inventory/items/${itemId}`, data),
    deleteItem: (projectId: number, itemId: number) =>
        api.delete(`/proyectos/${projectId}/inventory/items/${itemId}`),
};

// Operations API endpoints
export const operationsApi = {
    getLotes: (projectId: number) => api.get(`/proyectos/${projectId}/operations/lotes`),
    createLote: (projectId: number, data: any) =>
        api.post(`/proyectos/${projectId}/operations/lotes`, data),
    updateLoteStage: (projectId: number, loteId: number, data: any) =>
        api.put(`/proyectos/${projectId}/operations/lotes/${loteId}/stage`, data),
    finishLote: (projectId: number, loteId: number) =>
        api.post(`/proyectos/${projectId}/operations/lotes/${loteId}/finish`),
};

export default api;
