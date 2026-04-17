import React from 'react';
import { Text, TextProps } from 'react-native';

interface InputErrorProps extends TextProps {
    children: React.ReactNode;
}

export default function InputError({
    children,
    className = '',
    ...props
}: InputErrorProps) {
    if (!children) return null;

    return (
        <Text
            className={`
                text-sm font-medium
                text-danger-600 dark:text-danger-400
                mt-1.5
                ${className}
            `}
            {...props}
        >
            {children}
        </Text>
    );
}
