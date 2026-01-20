import React from 'react';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, View, Text } from 'react-native';

interface InputProps extends RNTextInputProps {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <View className="mb-4">
            {label && (
                <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {label}
                </Text>
            )}
            <RNTextInput
                className={`
                    bg-white dark:bg-gray-800 
                    border border-gray-200 dark:border-gray-700 
                    rounded-xl px-4 py-4 
                    text-base text-gray-800 dark:text-gray-100
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    ${className}
                `}
                placeholderTextColor="#9ca3af"
                {...props}
            />
            {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
        </View>
    );
}
