import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface SecondaryButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    loading?: boolean;
}

export default function SecondaryButton({
    type, // Ignored in RN but kept for API compatibility if needed
    className = '',
    disabled,
    loading,
    children,
    ...props
}: SecondaryButtonProps & { type?: 'button' | 'submit' | 'reset' }) {
    return (
        <TouchableOpacity
            {...props}
            disabled={disabled || loading}
            className={`
                flex-row items-center justify-center rounded-xl 
                bg-gray-100 dark:bg-gray-800 
                px-4 py-4 
                ${disabled ? 'opacity-50' : ''} 
                ${className}
            `}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#6B7280" />
            ) : (
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
}
