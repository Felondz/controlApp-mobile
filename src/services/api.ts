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

// Response interceptor - handle 401 errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear storage
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            // Navigation to login will be handled by AuthContext
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/login', { email, password }),

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
