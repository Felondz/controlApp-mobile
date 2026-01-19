/**
 * Auth Store - Zustand store for authentication state
 * Uses expo-secure-store for persistent token storage
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, TOKEN_KEY, USER_KEY } from '../services/api';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    // Initialize auth state from secure storage
    initialize: async () => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const userJson = await SecureStore.getItemAsync(USER_KEY);

            if (token && userJson) {
                const user = JSON.parse(userJson);
                set({ user, token, isAuthenticated: true, isLoading: false });

                // Verify token is still valid
                try {
                    const response = await authApi.getUser();
                    set({ user: response.data });
                    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.data));
                } catch (error) {
                    // Token invalid, clear everything
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                    await SecureStore.deleteItemAsync(USER_KEY);
                    set({ user: null, token: null, isAuthenticated: false });
                }
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ isLoading: false });
        }
    },

    // Login
    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login(email, password);
            const { token, user } = response.data;

            // Store in secure storage
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al iniciar sesión';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    // Register
    register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            const { token, user } = response.data;

            // Store in secure storage
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al registrarse';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    // Logout
    logout: async () => {
        set({ isLoading: true });
        try {
            await authApi.logout();
        } catch (error) {
            // Ignore logout API errors
        }

        // Clear secure storage
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);

        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useAuthStore;
