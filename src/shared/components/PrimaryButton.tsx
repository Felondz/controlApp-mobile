import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    loading?: boolean;
}

export default function PrimaryButton({
    className = '',
    disabled,
    loading,
    children,
    ...props
}: PrimaryButtonProps) {
    return (
        <TouchableOpacity
            {...props}
            disabled={disabled || loading}
            className={`
                flex-row items-center justify-center rounded-xl 
                bg-purple-50 dark:bg-purple-900/20 
                px-4 py-4 
                ${disabled ? 'opacity-50' : ''} 
                ${className}
            `}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#A855F7" />
            ) : (
                <Text className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
}
