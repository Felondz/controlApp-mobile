import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { preferencesApi } from '../services/api';

import { Appearance } from 'react-native';

interface SettingsState {
    theme: string;
    isDark: boolean;
    locale: 'es' | 'en';
    visibleWidgets: Record<string, boolean>;
    isInitialized: boolean;
    setTheme: (theme: string, syncToBackend?: boolean) => Promise<void>;
    toggleDarkMode: () => Promise<void>;
    setLocale: (locale: 'es' | 'en') => Promise<void>;
    toggleWidget: (widgetKey: string) => Promise<void>;
    initialize: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    theme: 'purple-modern',
    isDark: Appearance.getColorScheme() === 'dark',
    locale: 'es',
    visibleWidgets: {
        finance_balance: true,
        finance_charts: true,
        tasks: true,
        chat: true,
        inventory: true,
        operations: true,
    },
    isInitialized: false,

    setTheme: async (theme: string, syncToBackend = true) => {
        set({ theme });
        await AsyncStorage.setItem('settings_theme', theme);

        if (syncToBackend) {
            try {
                // 1. Sync to Backend
                await preferencesApi.updateTheme(theme);

                // 2. Sync to AuthStore user object for session persistence
                const { useAuthStore } = require('./authStore');
                const authState = useAuthStore.getState();
                
                if (authState.user) {
                    const updatedUser = { ...authState.user, global_theme: theme };
                    authState.updateSettings(authState.user.settings || { completed_tours: [] }); // Trigger store update if needed
                    
                    // Manually update user with new theme in auth store
                    useAuthStore.setState({ user: updatedUser });
                    
                    // 3. Persist updated user to SecureStore
                    const SecureStore = require('expo-secure-store');
                    const { USER_KEY } = require('../services/api');
                    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
                }
            } catch (error) {
                console.warn('Failed to sync theme with backend or auth store:', error);
            }
        }
    },

    toggleDarkMode: async () => {
        const newIsDark = !get().isDark;
        set({ isDark: newIsDark });
        await AsyncStorage.setItem('settings_is_dark', String(newIsDark));
    },

    setLocale: async (locale: 'es' | 'en') => {
        set({ locale });
        await AsyncStorage.setItem('settings_locale', locale);
    },

    toggleWidget: async (widgetKey: string) => {
        const current = get().visibleWidgets;
        const updated = { ...current, [widgetKey]: !current[widgetKey] };
        set({ visibleWidgets: updated });
        await AsyncStorage.setItem('settings_visible_widgets', JSON.stringify(updated));
    },

    initialize: async () => {
        if (get().isInitialized) return;

        try {
            const [storedTheme, storedIsDark, storedLocale, storedWidgets] = await Promise.all([
                AsyncStorage.getItem('settings_theme'),
                AsyncStorage.getItem('settings_is_dark'),
                AsyncStorage.getItem('settings_locale'),
                AsyncStorage.getItem('settings_visible_widgets'),
            ]);

            const systemDark = Appearance.getColorScheme() === 'dark';

            set({
                theme: storedTheme || 'purple-modern',
                isDark: storedIsDark !== null ? storedIsDark === 'true' : systemDark,
                locale: (storedLocale as 'es' | 'en') || 'es',
                visibleWidgets: storedWidgets ? JSON.parse(storedWidgets) : get().visibleWidgets,
                isInitialized: true,
            });
        } catch (error) {
            console.error('Failed to load settings:', error);
            set({ isInitialized: true });
        }
    },
}));
