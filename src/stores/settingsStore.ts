import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
    theme: string;
    isDark: boolean;
    isInitialized: boolean;
    setTheme: (theme: string) => Promise<void>;
    toggleDarkMode: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    theme: 'purple-modern',
    isDark: false,
    isInitialized: false,

    setTheme: async (theme: string) => {
        set({ theme });
        await AsyncStorage.setItem('settings_theme', theme);
    },

    toggleDarkMode: async () => {
        const newIsDark = !get().isDark;
        set({ isDark: newIsDark });
        await AsyncStorage.setItem('settings_is_dark', String(newIsDark));
    },

    initialize: async () => {
        if (get().isInitialized) return;

        try {
            const [storedTheme, storedIsDark] = await Promise.all([
                AsyncStorage.getItem('settings_theme'),
                AsyncStorage.getItem('settings_is_dark'),
            ]);

            set({
                theme: storedTheme || 'purple-modern',
                isDark: storedIsDark === 'true',
                isInitialized: true,
            });
        } catch (error) {
            console.error('Failed to load settings:', error);
            set({ isInitialized: true });
        }
    },
}));
