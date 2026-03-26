import React from 'react';
import { Text, TextProps } from 'react-native';

interface InputLabelProps extends TextProps {
    children: React.ReactNode;
    required?: boolean;
}

export default function InputLabel({
    children,
    required = false,
    className = '',
    ...props
}: InputLabelProps) {
    return (
        <Text
            className={`
                text-sm font-medium
                text-secondary-700 dark:text-secondary-300
                mb-1.5
                ${className}
            `}
            {...props}
        >
            {children}
            {required && (
                <Text className="text-danger-500 ml-0.5">*</Text>
            )}
        </Text>
    );
}
