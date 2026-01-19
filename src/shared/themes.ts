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
    | 'scarlet-red';

// Convert RGB "R G B" to HEX "#RRGGBB"
const rgbToHex = (rgb: string): string => {
    const [r, g, b] = rgb.split(' ').map(Number);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

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
    { id: 'forest-green', name: 'Forest Green', color: '#10b981' },
    { id: 'ocean-blue', name: 'Ocean Blue', color: '#06b6d4' },
    { id: 'amber-gold', name: 'Amber Gold', color: '#f59e0b' },
    { id: 'pink-rose', name: 'Pink Rose', color: '#ec4899' },
    { id: 'scarlet-red', name: 'Scarlet Red', color: '#ef4444' },
] as const;

export default THEMES;
