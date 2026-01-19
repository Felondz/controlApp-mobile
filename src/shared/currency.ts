/**
 * Currency formatting utilities
 * Standardized currency display for future multi-currency support
 */

type CurrencyCode = 'USD' | 'COP' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'MXN' | 'BRL' | 'ARS' | 'CLP' | 'PEN' | 'CAD' | 'AUD' | 'CHF' | 'INR' | 'RUB' | 'KRW' | 'TRY' | 'ZAR';

const CURRENCY_SYMBOLS: Record<string, string> = {
    'USD': '$',
    'COP': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'MXN': '$',
    'BRL': 'R$',
    'ARS': '$',
    'CLP': '$',
    'PEN': 'S/',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'INR': '₹',
    'RUB': '₽',
    'KRW': '₩',
    'TRY': '₺',
    'ZAR': 'R',
};

const CURRENCY_LOCALES: Record<string, string> = {
    'COP': 'es-CO',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP',
    'CNY': 'zh-CN',
    'MXN': 'es-MX',
    'BRL': 'pt-BR',
    'ARS': 'es-AR',
    'CLP': 'es-CL',
    'PEN': 'es-PE',
    'CAD': 'en-CA',
    'AUD': 'en-AU',
    'CHF': 'de-CH',
    'INR': 'en-IN',
    'RUB': 'ru-RU',
    'KRW': 'ko-KR',
    'TRY': 'tr-TR',
    'ZAR': 'en-ZA',
};

// Currencies without decimals (whole numbers only)
const NO_DECIMAL_CURRENCIES = ['COP', 'JPY', 'KRW', 'CLP'];

/**
 * Get currency symbol for a given currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
    return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

/**
 * Get locale string for currency formatting
 */
export const getCurrencyLocale = (currencyCode: string): string => {
    return CURRENCY_LOCALES[currencyCode] || 'en-US';
};

/**
 * Check if currency should show decimal places
 */
export const shouldShowDecimals = (currencyCode: string): boolean => {
    return !NO_DECIMAL_CURRENCIES.includes(currencyCode);
};

/**
 * Format currency amount with proper symbol and structure
 */
export const formatCurrency = (
    amount: number,
    currencyCode: string = 'COP',
    divideByCents: boolean = true
): string => {
    const symbol = getCurrencySymbol(currencyCode);
    const locale = getCurrencyLocale(currencyCode);
    const decimals = shouldShowDecimals(currencyCode) ? 2 : 0;
    const value = divideByCents ? amount / 100 : amount;

    const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(Math.abs(value));

    return `${symbol}${formatted}`;
};
