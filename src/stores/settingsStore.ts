import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { preferencesApi } from '../services/api';

import { Appearance } from 'react-native';

interface SettingsState {
    theme: string;
    isDark: boolean;
    locale: 'es' | 'en';
    isInitialized: boolean;
    setTheme: (theme: string, syncToBackend?: boolean) => Promise<void>;
    toggleDarkMode: () => Promise<void>;
    setLocale: (locale: 'es' | 'en') => Promise<void>;
    initialize: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    theme: 'purple-modern',
    isDark: Appearance.getColorScheme() === 'dark',
    locale: 'es',
    isInitialized: false,

    setTheme: async (theme: string, syncToBackend = true) => {
        set({ theme });
        await AsyncStorage.setItem('settings_theme', theme);

        if (syncToBackend) {
            try {
                await preferencesApi.updateTheme(theme);
            } catch (error) {
                console.warn('Failed to sync theme with backend:', error);
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

    initialize: async () => {
        if (get().isInitialized) return;

        try {
            const [storedTheme, storedIsDark, storedLocale] = await Promise.all([
                AsyncStorage.getItem('settings_theme'),
                AsyncStorage.getItem('settings_is_dark'),
                AsyncStorage.getItem('settings_locale'),
            ]);

            const systemDark = Appearance.getColorScheme() === 'dark';

            set({
                theme: storedTheme || 'purple-modern',
                isDark: storedIsDark !== null ? storedIsDark === 'true' : systemDark,
                locale: (storedLocale as 'es' | 'en') || 'es',
                isInitialized: true,
            });
        } catch (error) {
            console.error('Failed to load settings:', error);
            set({ isInitialized: true });
        }
    },
}));
