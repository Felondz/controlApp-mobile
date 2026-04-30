import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, preferencesApi, TOKEN_KEY, USER_KEY, CREDENTIALS_KEY, setAuthCallbacks } from '../services/api';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useSettingsStore } from './settingsStore';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
    global_theme?: string;
    profile_photo_url?: string;
    unread_messages_count?: number;
    enabled_tools?: string[];
    settings?: {
        completed_tours: string[];
    };
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
    loginWithGoogle: (token: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
    updateSettings: (settings: { completed_tours: string[] }) => void;
    toggleTool: (toolId: string) => Promise<void>;
    setUser: (user: User) => void;
    fetchUser: () => Promise<void>;
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

                        // Sync Global Theme
                        if (user.global_theme) {
                            useSettingsStore.getState().setTheme(user.global_theme, false);
                        }

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

                // Sync Global Theme from cache (optimistic)
                if (user.global_theme) {
                    useSettingsStore.getState().setTheme(user.global_theme, false);
                }

                // Verify token is still valid before fully committing to authenticated state
                try {
                    const response = await authApi.getUser();
                    const freshUser = response.data;
                    
                    set({ 
                        user: freshUser, 
                        token, 
                        isAuthenticated: true, 
                        isLoading: false 
                    });
                    
                    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(freshUser));

                    // Sync Global Theme from fresh logic
                    if (freshUser.global_theme) {
                        useSettingsStore.getState().setTheme(freshUser.global_theme, false);
                    }
                } catch (error) {
                    console.log('[AuthStore] Token verification failed on init:', error);
                    // Clear state if verification fails
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                    await SecureStore.deleteItemAsync(USER_KEY);
                    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                }
            } else {
                set({ isAuthenticated: false, isLoading: false });
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

            // Sync Global Theme
            if (user.global_theme) {
                useSettingsStore.getState().setTheme(user.global_theme, false);
            }

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

    // Login with Google
    loginWithGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
            const deviceName = getDeviceName();
            const response = await authApi.loginWithGoogle(idToken, deviceName);
            const { access_token: token, user } = response.data;

            // Store token and user
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

            // Sync Global Theme
            if (user.global_theme) {
                useSettingsStore.getState().setTheme(user.global_theme, false);
            }

            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al iniciar sesión con Google';
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

    // Update settings optimistically
    updateSettings: (settings) => set((state) => ({
        user: state.user ? { ...state.user, settings } : null
    })),

    // Toggle tool locally and persist to storage and backend
    toggleTool: async (toolId: string) => {
        const { user } = get();
        if (!user) return;

        const currentTools = user.enabled_tools || [];
        const isEnabled = currentTools.includes(toolId);
        const newTools = isEnabled
            ? currentTools.filter(id => id !== toolId)
            : [...currentTools, toolId];
        
        const updatedUser = { ...user, enabled_tools: newTools };
        
        // Optimistic update
        set({ user: updatedUser });
        
        // Persist to storage and sync with backend
        try {
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
            await preferencesApi.toggleTool(toolId, !isEnabled);
        } catch (error) {
            console.error('Error saving updated user tools:', error);
            // Rollback on error
            set({ user });
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        }
    },
    // Set user from external source (like real-time events)
    setUser: (user) => {
        console.log('[AuthStore] Received user update payload:', user?.enabled_tools);
        // Map backend tool names to mobile names
        if (user.enabled_tools) {
            user.enabled_tools = user.enabled_tools.map((t: string) => 
                t === 'financial-calculator' ? 'calculator' : t
            );
            console.log('[AuthStore] Mapped tools:', user.enabled_tools);
        }

        set({ user });
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(err => 
            console.error('Error persisting real-time user update:', err)
        );
        // Sync Global Theme if it changed
        if (user.global_theme) {
            useSettingsStore.getState().setTheme(user.global_theme, false);
        }
    },
    // Fetch fresh user data from server
    fetchUser: async () => {
        console.log('[AuthStore] Fetching fresh user data...');
        try {
            const response = await authApi.getUser();
            const userData = response.data;
            
            console.log('[AuthStore] Server user tools:', userData?.enabled_tools);
            
            // Map backend tool names to mobile names
            if (userData.enabled_tools) {
                userData.enabled_tools = userData.enabled_tools.map((t: string) => 
                    t === 'financial-calculator' ? 'calculator' : t
                );
                console.log('[AuthStore] Mapped tools (fetch):', userData.enabled_tools);
            }

            set({ user: userData });
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
            
            // Sync Global Theme if it changed
            if (userData.global_theme) {
                useSettingsStore.getState().setTheme(userData.global_theme, false);
            }
        } catch (error) {
            console.error('Error fetching fresh user data:', error);
        }
    },
}));

// Setup default settings when returning user
const withDefaultSettings = (user: User): User => {
    return {
        ...user,
        settings: user.settings || { completed_tours: [] }
    };
};

export default useAuthStore;
