import React from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';

interface InputProps extends RNTextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export default function Input({ label, error, className = '', containerClassName = '', ...props }: InputProps) {
    const { isDark } = useSettingsStore();
    const hasError = !!error;

    return (
        <View className={`mb-4 ${containerClassName}`}>
            {label && (
                <Text className="text-secondary-700 dark:text-secondary-300 font-medium mb-2 text-base">
                    {label}
                </Text>
            )}
            <RNTextInput
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                className={`
                    bg-white dark:bg-secondary-800
                    border rounded-2xl px-5 py-4.5 text-base
                    text-secondary-900 dark:text-secondary-100
                    ${hasError 
                        ? 'border-danger-500 dark:border-danger-500' 
                        : 'border-secondary-200 dark:border-secondary-700 focus:border-primary-500'
                    }
                    ${className}
                `}
                {...props}
            />
            {error && <Text className="text-danger-500 text-sm mt-1 ml-1">{error}</Text>}
        </View>
    );
}
