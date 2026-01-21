import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, TOKEN_KEY, USER_KEY, CREDENTIALS_KEY, setAuthCallbacks } from '../services/api';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
    login: (email: string, password: string, remember: boolean) => Promise<boolean>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

// Helper to get device name
const getDeviceName = () => {
    if (Platform.OS === 'web') return 'Web Browser';
    return `${Device.brand || 'Unknown'} ${Device.modelName || 'Device'}`;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    // Initialize auth state from secure storage
    initialize: async () => {
        try {
            // Setup callbacks for API
            setAuthCallbacks(
                // Silent Login Callback
                async () => {
                    try {
                        const credentialsJson = await SecureStore.getItemAsync(CREDENTIALS_KEY);
                        if (!credentialsJson) return null;

                        const { email, password } = JSON.parse(credentialsJson);
                        // Force remember=true for auto-renewal to get another long-lived token
                        const deviceName = getDeviceName();
                        const response = await authApi.login(email, password, true, deviceName);
                        const { access_token: token, user } = response.data;

                        // Update store
                        await SecureStore.setItemAsync(TOKEN_KEY, token);
                        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
                        // Credentials remain stored since we want to keep renewing

                        set({ user, token, isAuthenticated: true });
                        return token;
                    } catch (error) {
                        console.error('Silent login failed:', error);
                        return null;
                    }
                },
                // Logout Callback
                () => {
                    set({ user: null, token: null, isAuthenticated: false });
                }
            );

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
                    // Token invalid/expired will be handled by interceptor -> silent login attempt
                    // If that fails, interceptor calls logout callback which updates state
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
    login: async (email: string, password: string, remember: boolean) => {
        set({ isLoading: true, error: null });
        try {
            const deviceName = getDeviceName();
            const response = await authApi.login(email, password, remember, deviceName);
            const { access_token: token, user } = response.data;

            // Store token and user
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

            // Store/Remove credentials based on remember me
            if (remember) {
                await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ email, password }));
            } else {
                await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
            }

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
            // 1. Register
            await authApi.register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            // No token expected. Registration successful.

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

        // Clear all secure storage
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        await SecureStore.deleteItemAsync(CREDENTIALS_KEY); // User explicitly logged out, forget credentials

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
