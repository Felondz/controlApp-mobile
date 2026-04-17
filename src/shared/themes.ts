/**
 * Theme Styles for ControlApp Mobile
 * Converted from RGB to HEX for React Native compatibility
 */

export interface ThemeColors {
    primary50: string;
    primary100: string;
    primary200: string;
    primary300: string;
    primary400: string;
    primary500: string;
    primary600: string;
    primary700: string;
    primary800: string;
    primary900: string;
    primary950: string;
}

export type ThemeId =
    | 'purple-modern'
    | 'forest-green'
    | 'ocean-blue'
    | 'amber-gold'
    | 'pink-rose'
    | 'scarlet-red'
    | 'emerald-nature'
    | 'blue-ocean'
    | 'cyan-tech'
    | 'amber-warm'
    | 'rose-romantic';

// Theme definitions with HEX colors
export const THEMES: Record<ThemeId, ThemeColors> = {
    'purple-modern': {
        primary50: '#faf5ff',
        primary100: '#f3e8ff',
        primary200: '#e9d5ff',
        primary300: '#d8b4fe',
        primary400: '#c084fc',
        primary500: '#a855f7',
        primary600: '#9333ea',
        primary700: '#7e22ce',
        primary800: '#6b21a8',
        primary900: '#581c87',
        primary950: '#3b0764',
    },
    'forest-green': {
        primary50: '#ecfdf5',
        primary100: '#d1fae5',
        primary200: '#a7f3d0',
        primary300: '#6ee7b7',
        primary400: '#34d399',
        primary500: '#10b981',
        primary600: '#059669',
        primary700: '#047857',
        primary800: '#065f46',
        primary900: '#064e3b',
        primary950: '#022c22',
    },
    'ocean-blue': {
        primary50: '#ecfeff',
        primary100: '#cffafe',
        primary200: '#a5f3fc',
        primary300: '#67e8f9',
        primary400: '#22d3ee',
        primary500: '#06b6d4',
        primary600: '#0891b2',
        primary700: '#0e7490',
        primary800: '#155e75',
        primary900: '#164e63',
        primary950: '#083344',
    },
    'amber-gold': {
        primary50: '#fffbeb',
        primary100: '#fef3c7',
        primary200: '#fde68a',
        primary300: '#fcd34d',
        primary400: '#fbbf24',
        primary500: '#f59e0b',
        primary600: '#d97706',
        primary700: '#b45309',
        primary800: '#92400e',
        primary900: '#78350f',
        primary950: '#451a03',
    },
    'pink-rose': {
        primary50: '#fdf2f8',
        primary100: '#fce7f3',
        primary200: '#fbcce7',
        primary300: '#f9a8d4',
        primary400: '#f472b6',
        primary500: '#ec4899',
        primary600: '#db2777',
        primary700: '#be185d',
        primary800: '#9d174d',
        primary900: '#831843',
        primary950: '#500724',
    },
    'scarlet-red': {
        primary50: '#fef2f2',
        primary100: '#fee2e2',
        primary200: '#fecaca',
        primary300: '#fca5a5',
        primary400: '#f87171',
        primary500: '#ef4444',
        primary600: '#dc2626',
        primary700: '#b91c1c',
        primary800: '#991b1b',
        primary900: '#7f1d1d',
        primary950: '#450a0a',
    },
    'emerald-nature': {
        primary50: '#f0fdf4',
        primary100: '#dcfce7',
        primary200: '#bbf7d0',
        primary300: '#86efac',
        primary400: '#4ade80',
        primary500: '#22c55e',
        primary600: '#16a34a',
        primary700: '#15803d',
        primary800: '#166534',
        primary900: '#14532d',
        primary950: '#052e16',
    },
    'blue-ocean': {
        primary50: '#eff6ff',
        primary100: '#dbeafe',
        primary200: '#bfdbfe',
        primary300: '#93c5fd',
        primary400: '#60a5fa',
        primary500: '#3b82f6',
        primary600: '#2563eb',
        primary700: '#1d4ed8',
        primary800: '#1e40af',
        primary900: '#1e3a8a',
        primary950: '#172554',
    },
    'cyan-tech': {
        primary50: '#ecfeff',
        primary100: '#cffafe',
        primary200: '#a5f3fc',
        primary300: '#67e8f9',
        primary400: '#22d3ee',
        primary500: '#06b6d4',
        primary600: '#0891b2',
        primary700: '#0e7490',
        primary800: '#155e75',
        primary900: '#164e63',
        primary950: '#083344',
    },
    'amber-warm': {
        primary50: '#fff7ed',
        primary100: '#ffedd5',
        primary200: '#fed7aa',
        primary300: '#fdba74',
        primary400: '#fb923c',
        primary500: '#f97316',
        primary600: '#ea580c',
        primary700: '#c2410c',
        primary800: '#9a3412',
        primary900: '#7c2d12',
        primary950: '#431407',
    },
    'rose-romantic': {
        primary50: '#fff1f2',
        primary100: '#ffe4e6',
        primary200: '#fecdd3',
        primary300: '#fda4af',
        primary400: '#fb7185',
        primary500: '#f43f5e',
        primary600: '#e11d48',
        primary700: '#be123c',
        primary800: '#9f1239',
        primary900: '#881337',
        primary950: '#4c0519',
    },
};

/**
 * Get theme colors by theme ID
 */
export const getTheme = (themeId: string): ThemeColors => {
    return THEMES[themeId as ThemeId] || THEMES['purple-modern'];
};

/**
 * Available theme options for selection UI
 */
export const THEME_OPTIONS = [
    { id: 'purple-modern', name: 'Purple Modern', color: '#a855f7' },
    { id: 'ocean-blue', name: 'Ocean Blue', color: '#06b6d4' },
    { id: 'forest-green', name: 'Forest Green', color: '#10b981' },
    { id: 'scarlet-red', name: 'Scarlet Red', color: '#ef4444' },
    { id: 'amber-gold', name: 'Amber Gold', color: '#f59e0b' },
    { id: 'pink-rose', name: 'Pink Rose', color: '#ec4899' },
    { id: 'emerald-nature', name: 'Emerald', color: '#22c55e' },
    { id: 'blue-ocean', name: 'Classic Blue', color: '#3b82f6' },
    { id: 'cyan-tech', name: 'Cyan Tech', color: '#0891b2' },
    { id: 'amber-warm', name: 'Warm Orange', color: '#f97316' },
    { id: 'rose-romantic', name: 'Rose Red', color: '#f43f5e' },
] as const;

export default THEMES;
