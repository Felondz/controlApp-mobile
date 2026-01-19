/**
 * Alert Component - Design System
 * Matches web Alert.jsx with info, warning, success, error types
 */
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

export type AlertType = 'info' | 'warning' | 'success' | 'error';

export interface AlertProps {
    type?: AlertType;
    title?: string;
    children: React.ReactNode;
    style?: ViewStyle;
}

const typeStyles: Record<AlertType, { bg: string; border: string; text: string; title: string }> = {
    info: {
        bg: '#eff6ff',
        border: '#bfdbfe',
        text: '#1e40af',
        title: '#1e3a8a',
    },
    warning: {
        bg: '#fffbeb',
        border: '#fde68a',
        text: '#b45309',
        title: '#92400e',
    },
    success: {
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '#047857',
        title: '#065f46',
    },
    error: {
        bg: '#fef2f2',
        border: '#fecaca',
        text: '#b91c1c',
        title: '#991b1b',
    },
};

export function Alert({ type = 'info', title, children, style }: AlertProps) {
    const colors = typeStyles[type];

    return (
        <View
            style={[
                {
                    backgroundColor: colors.bg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 16,
                },
                style,
            ]}
        >
            {title && (
                <Text
                    style={{
                        color: colors.title,
                        fontWeight: '600',
                        fontSize: 14,
                        marginBottom: 4,
                    }}
                >
                    {title}
                </Text>
            )}
            {typeof children === 'string' ? (
                <Text style={{ color: colors.text, fontSize: 14 }}>{children}</Text>
            ) : (
                children
            )}
        </View>
    );
}

export default Alert;
