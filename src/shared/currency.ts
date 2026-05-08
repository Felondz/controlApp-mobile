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

/**
 * Parse a formatted currency string back to a raw integer of digits
 */
const getRawDigits = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, '') || '0', 10);
};

/**
 * Real-time mask for currency inputs
 */
export const maskCurrency = (value: string, currencyCode: string = 'COP'): string => {
    const numericValue = getRawDigits(value);
    
    const showDecimals = shouldShowDecimals(currencyCode);
    const symbol = getCurrencySymbol(currencyCode);
    const locale = getCurrencyLocale(currencyCode);
    
    const floatValue = showDecimals ? numericValue / 100 : numericValue;
    const decimals = showDecimals ? 2 : 0;

    let formatted = '';
    try {
        formatted = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(floatValue);
    } catch (e) {
        // Fallback for environments with limited Intl support
        const fixed = floatValue.toFixed(decimals);
        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currencyCode === 'USD' ? ',' : '.');
        formatted = parts.join(currencyCode === 'USD' ? '.' : ',');
    }

    return `${symbol} ${formatted}`;
};

/**
 * Parse masked value to cents (integer)
 * Backend expects standard 2-decimal shift for EVERYTHING.
 * $ 1,000.00 -> 100,000
 * $ 1.000 -> 100.000
 */
export const parseToCents = (value: string, _currencyCode: string = 'COP'): number => {
    const digits = getRawDigits(value);
    // If it's COP and the mask didn't use decimals, we still need to shift by 100
    // because the backend expects cents.
    if (!shouldShowDecimals(_currencyCode)) {
        return digits * 100;
    }
    return digits;
};

/**
 * Parse masked value to units (float)
 * $ 12.34 -> 12.34
 * $ 1.234 -> 1234.0
 */
export const parseToUnits = (value: string, currencyCode: string = 'COP'): number => {
    const digits = getRawDigits(value);
    if (shouldShowDecimals(currencyCode)) {
        return digits / 100;
    }
    return digits;
};

