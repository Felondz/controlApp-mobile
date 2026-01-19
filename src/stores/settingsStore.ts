/**
 * Settings store for app preferences (theme, locale, etc.)
 * Uses Zustand with persistence via AsyncStorage
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'controlapp_settings';

export interface SettingsState {
    locale: 'es' | 'en';
    theme: string;
    darkMode: boolean;
    isInitialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    setLocale: (locale: 'es' | 'en') => Promise<void>;
    setTheme: (theme: string) => Promise<void>;
    setDarkMode: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    locale: 'es',
    theme: 'purple-modern',
    darkMode: false,
    isInitialized: false,

    initialize: async () => {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const settings = JSON.parse(stored);
                set({
                    locale: settings.locale || 'es',
                    theme: settings.theme || 'purple-modern',
                    darkMode: settings.darkMode || false,
                    isInitialized: true,
                });
            } else {
                set({ isInitialized: true });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            set({ isInitialized: true });
        }
    },

    setLocale: async (locale) => {
        set({ locale });
        await saveSettings(get());
    },

    setTheme: async (theme) => {
        set({ theme });
        await saveSettings(get());
    },

    setDarkMode: async (darkMode) => {
        set({ darkMode });
        await saveSettings(get());
    },
}));

// Helper to persist settings
async function saveSettings(state: SettingsState) {
    try {
        const data = {
            locale: state.locale,
            theme: state.theme,
            darkMode: state.darkMode,
        };
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}
