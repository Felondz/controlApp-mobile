import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';

interface DangerButtonProps extends PressableProps {
    children: React.ReactNode;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    variant?: 'filled' | 'soft' | 'outline';
    className?: string;
}

export default function DangerButton({
    className = '',
    disabled,
    loading,
    children,
    size = 'md',
    fullWidth = false,
    variant = 'filled',
    onPress,
    ...props
}: DangerButtonProps) {
    const sizeClasses = {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
        xl: 'px-8 py-5',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    };

    const variantClasses = {
        filled: 'bg-danger-600 dark:bg-danger-600 border-transparent',
        soft: 'bg-danger-50 dark:bg-danger-900/20 border-danger-100 dark:border-danger-800',
        outline: 'bg-transparent border-2 border-danger-600 dark:border-danger-500',
    };

    const textColorClasses = {
        filled: 'text-white',
        soft: 'text-danger-700 dark:text-danger-400',
        outline: 'text-danger-600 dark:text-danger-400',
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            className={`
                flex-row items-center justify-center rounded-2xl border active:opacity-80
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${fullWidth ? 'w-full' : ''}
                ${disabled || loading ? 'opacity-50' : ''}
                ${className}
            `}
            style={typeof props.style === 'function' ? props.style : props.style as any}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'filled' ? '#ffffff' : '#ef4444'}
                />
            ) : (
                <Text
                    className={`
                        font-bold uppercase tracking-widest
                        ${textColorClasses[variant]}
                        ${textSizeClasses[size]}
                    `}
                >
                    {children}
                </Text>
            )}
        </Pressable>
    );
}
