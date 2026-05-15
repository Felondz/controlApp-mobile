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
    timeout: 15000,
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
        const authEndpoints = ['/login', '/register', '/auth/google/token', '/forgot-password', '/reset-password'];
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            // Attempt silent login if callback configurd
            if (silentLoginCallback) {
                try {
                    console.log(`[API] 401 en ${originalRequest.url}, intentando silent login...`);
                    const newToken = await silentLoginCallback();

                    if (newToken) {
                        console.log('[API] Silent login exitoso, reintentando petición...');
                        // Update header and retry
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('[API] Error en silent login:', refreshError);
                }
            }

            console.log('[API] Silent login no disponible o fallido, cerrando sesión...');
            if (logoutCallback) logoutCallback();
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authApi = {
    login: (email: string, password: string, remember_me: boolean, device_name: string) =>
        api.post('/login', { email, password, remember_me, device_name }),

    loginWithGoogle: (token: string, device_name: string) =>
        api.post('/auth/google/token', { token, device_name }),

    register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
        api.post('/register', data),

    logout: () =>
        api.post('/logout'),

    getUser: () =>
        api.get('/user'),

    updateProfile: (data: FormData) =>
        api.post('/profile', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    verifyEmail: (id: string, hash: string, expires: string, signature: string) =>
        api.get(`/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`),

    forgotPassword: (email: string) =>
        api.post('/forgot-password', { email }),

    resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
        api.post('/reset-password', data),

    updatePassword: (data: any) =>
        api.put('/password', data),
};

// Projects API endpoints
export const projectsApi = {
    getAll: () => api.get('/proyectos'),
    getOne: (uuid: string) => api.get(`/proyectos/${uuid}`),
    create: (data: any) => api.post('/proyectos', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    }),
    update: (uuid: string, data: any) => {
        // Use POST with _method spoofing if it's FormData, else regular PUT
        if (data instanceof FormData) {
            return api.post(`/proyectos/${uuid}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/proyectos/${uuid}`, data);
    },
    delete: (uuid: string) => api.delete(`/proyectos/${uuid}`),
};

// Finance API endpoints
export const financeApi = {
    getAccounts: (projectUuid: string) => api.get(`/proyectos/${projectUuid}/cuentas`),
    getTransactions: (projectUuid: string) => api.get(`/proyectos/${projectUuid}/transacciones`),
    getBalance: (projectUuid: string) => api.get(`/proyectos/${projectUuid}/finance/balance`),
    createTransaction: (projectUuid: string, data: any) =>
        api.post(`/proyectos/${projectUuid}/transacciones`, data),
    payDirect: (projectUuid: string, transactionId: string) =>
        api.post(`/proyectos/${projectUuid}/bills/${transactionId}/pay-direct`),
};

// Notifications API endpoints
export const notificationsApi = {
    delete: (uuid: string) => api.delete(`/notifications/${uuid}`),
    clearAll: (projectUuid?: string) => {
        const url = projectUuid ? `/notifications/all?project_uuid=${projectUuid}` : '/notifications/all';
        return api.delete(url);
    },
};

// Tasks API endpoints
export const tasksApi = {
    getAll: (projectUuid: string) => api.get(`/proyectos/${projectUuid}/tasks`),
    create: (projectUuid: string, data: any) => api.post(`/proyectos/${projectUuid}/tasks`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    }),
    update: (projectUuid: string, taskId: string, data: any) => {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/proyectos/${projectUuid}/tasks/${taskId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/proyectos/${projectUuid}/tasks/${taskId}`, data);
    },
    delete: (projectUuid: string, taskId: string) =>
        api.delete(`/proyectos/${projectUuid}/tasks/${taskId}`),
};

// Inventory API endpoints
export const inventoryApi = {
    getItems: (projectUuid: string) => api.get(`/proyectos/${projectUuid}/inventory/items`),
    createItem: (projectUuid: string, data: any) =>
        api.post(`/proyectos/${projectUuid}/inventory/items`, data),
    updateItem: (projectUuid: string, itemId: string, data: any) =>
        api.put(`/proyectos/${projectUuid}/inventory/items/${itemId}`, data),
    deleteItem: (projectUuid: string, itemId: string) =>
        api.delete(`/proyectos/${projectUuid}/inventory/items/${itemId}`),
};

// Operations API endpoints
export const operationsApi = {
    getLotes: (projectUuid: string) => api.get(`/proyectos/${projectUuid}/operations/lotes`),
    createLote: (projectUuid: string, data: any) =>
        api.post(`/proyectos/${projectUuid}/operations/lotes`, data),
    updateLoteStage: (projectUuid: string, loteId: string, data: any) =>
        api.put(`/proyectos/${projectUuid}/operations/lotes/${loteId}/stage`, data),
    finishLote: (projectUuid: string, loteId: string) =>
        api.post(`/proyectos/${projectUuid}/operations/lotes/${loteId}/finish`),
};

// Invitations API endpoints
export const invitationsApi = {
    accept: (uuid: string) => api.post(`/invitations/${uuid}/accept`),
    reject: (uuid: string) => api.post(`/invitations/${uuid}/reject`),
    
    // Project specific invitations
    getProjectInvitations: (projectUuid: string) => 
        api.get(`/proyectos/${projectUuid}/invitaciones`),
    create: (projectUuid: string, data: { email: string; nombre: string; rol?: string }) => 
        api.post(`/proyectos/${projectUuid}/invitaciones`, data),
    delete: (projectUuid: string, invitationId: string) => 
        api.delete(`/proyectos/${projectUuid}/invitaciones/${invitationId}`),
};

// Members API endpoints
export const membersApi = {
    getAll: (projectUuid: string) => 
        api.get(`/proyectos/${projectUuid}/miembros`),
    update: (projectUuid: string, userId: string, data: { rol: string }) => 
        api.put(`/proyectos/${projectUuid}/miembros/${userId}`, data),
    delete: (projectUuid: string, userId: string) => 
        api.delete(`/proyectos/${projectUuid}/miembros/${userId}`),
};

// Exports API endpoints
export const exportApi = {
    csv: (projectUuid: string, params: any) => 
        api.get(`/proyectos/${projectUuid}/export/csv`, { params, responseType: 'blob' }),
    pdf: (projectUuid: string, data: any) => 
        api.post(`/proyectos/${projectUuid}/export/pdf`, data, { responseType: 'blob' }),
};

// AI Chat API endpoints
export const aiApi = {
    chat: (message: string, context?: any) => 
        api.post('/ai/chat', { message, context }),
    getModels: () => 
        api.get('/llm/available-models'),
};

// Preferences API endpoints
export const preferencesApi = {
    updateTheme: (global_theme: string) => {
        const { useAuthStore } = require('../stores/authStore');
        const user = useAuthStore.getState().user;
        
        // Try profile update with full data to satisfy validation (name/email usually required)
        const payload = { 
            global_theme,
            name: user?.name,
            email: user?.email 
        };

        return api.put('/profile', payload).catch(err => {
            // Fallback for specific preference endpoint if it exists
            if (err.response?.status === 404) {
                return api.post('/preferences/theme/update', { global_theme });
            }
            throw err;
        });
    },
    updateDashboard: (settings: any) => api.put('/profile', { settings }),
    toggleTool: (tool_id: string, enabled: boolean) => {
        // Send both formats (ES/EN docs) to bypass 422 validation depending on backend version
        const toolName = tool_id === 'calculator' ? 'financial-calculator' : tool_id;
        return api.post('/tools/toggle', { 
            tool_id: tool_id, 
            enabled: enabled,
            tool: toolName,
            enable: enabled
        });
    },
};

// Bug Reporter (PTR) API endpoints
export const ptrApi = {
    reportBug: (data: any) => {
        // Use absolute URL to bypass the /api prefix from the default instance
        const url = (api.defaults.baseURL || '').replace('/api', '') + '/ptr/bug-reports';
        
        // IMPORTANT: If data is FormData, we must ensure Axios doesn't use the default application/json header
        const headers = data instanceof FormData 
            ? { 'Content-Type': 'multipart/form-data' } 
            : {};

        return api.post(url, data, { headers });
    },
    getStats: () => {
        const url = (api.defaults.baseURL || '').replace('/api', '') + '/ptr/bug-reports/stats';
        return api.get(url);
    },
};

// Search API endpoints
export const searchApi = {
    search: (query: string) => api.get(`/search?query=${encodeURIComponent(query)}`),
};

export default api;
