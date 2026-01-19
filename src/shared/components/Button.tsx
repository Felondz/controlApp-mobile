/**
 * Button Component - Design System
 * Matches web PrimaryButton, SecondaryButton, DangerButton
 */
import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTheme } from '../themes';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
        container: { paddingHorizontal: 12, paddingVertical: 8 },
        text: { fontSize: 12 },
    },
    md: {
        container: { paddingHorizontal: 16, paddingVertical: 12 },
        text: { fontSize: 14 },
    },
    lg: {
        container: { paddingHorizontal: 24, paddingVertical: 16 },
        text: { fontSize: 16 },
    },
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const { theme: themeId } = useSettingsStore();
    const theme = getTheme(themeId);

    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
        switch (variant) {
            case 'primary':
                return {
                    container: { backgroundColor: theme.primary500 },
                    text: { color: '#ffffff' },
                };
            case 'secondary':
                return {
                    container: { backgroundColor: '#f3f4f6' },
                    text: { color: '#374151' },
                };
            case 'danger':
                return {
                    container: { backgroundColor: '#ef4444' },
                    text: { color: '#ffffff' },
                };
            case 'outline':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: theme.primary500,
                    },
                    text: { color: theme.primary600 },
                };
            default:
                return {
                    container: { backgroundColor: theme.primary500 },
                    text: { color: '#ffffff' },
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeConfig = sizeStyles[size];

    const containerStyle: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        opacity: disabled || loading ? 0.5 : 1,
        ...sizeConfig.container,
        ...variantStyles.container,
        ...(fullWidth && { width: '100%' }),
        ...style,
    };

    const textStyle: TextStyle = {
        fontWeight: '600',
        ...sizeConfig.text,
        ...variantStyles.text,
    };

    return (
        <TouchableOpacity
            {...props}
            disabled={disabled || loading}
            style={containerStyle}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variantStyles.text.color as string}
                />
            ) : typeof children === 'string' ? (
                <Text style={textStyle}>{children}</Text>
            ) : (
                children
            )}
        </TouchableOpacity>
    );
}

export default Button;
