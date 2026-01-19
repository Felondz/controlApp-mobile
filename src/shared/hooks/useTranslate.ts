/**
 * Translation hook for ControlApp Mobile
 * Uses Zustand settingsStore for locale persistence
 */
import { useCallback } from 'react';
import en from '../translations/en.json';
import es from '../translations/es.json';
import { useSettingsStore } from '../../stores/settingsStore';

type TranslationData = Record<string, any>;

const translations: Record<string, TranslationData> = {
    en,
    es,
};

/**
 * Get a translation by key path (e.g., "auth.login", "common.save")
 */
const getNestedValue = (obj: TranslationData, path: string): string => {
    const keys = path.split('.');
    let value: any = obj;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return path; // Return key if not found
        }
    }

    return typeof value === 'string' ? value : path;
};

/**
 * Replace parameters in translation string
 * e.g., "Hello, :name" with { name: "John" } => "Hello, John"
 */
const replaceParams = (text: string, params?: Record<string, string | number>): string => {
    if (!params) return text;

    let result = text;
    for (const [key, value] of Object.entries(params)) {
        result = result.replace(`:${key}`, String(value));
    }
    return result;
};

export interface UseTranslateReturn {
    t: (key: string, params?: Record<string, string | number>) => string;
    locale: 'es' | 'en';
    setLocale: (locale: 'es' | 'en') => Promise<void>;
}

/**
 * Translation hook - use like useTranslate from web
 * Locale is persisted via Zustand + AsyncStorage
 * 
 * @example
 * const { t, locale, setLocale } = useTranslate();
 * t('auth.login') // "Iniciar Sesión"
 * t('common.welcome', { name: 'User' }) // "¡Bienvenido, User!"
 * setLocale('en') // Switch to English (persisted)
 */
export const useTranslate = (): UseTranslateReturn => {
    const { locale, setLocale } = useSettingsStore();

    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        const translation = translations[locale] || translations['es'];
        const text = getNestedValue(translation, key);
        return replaceParams(text, params);
    }, [locale]);

    return {
        t,
        locale,
        setLocale,
    };
};

export default useTranslate;
