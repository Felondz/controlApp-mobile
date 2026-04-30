import React from 'react';
import { Pressable, Text, ActivityIndicator, View, PressableProps } from 'react-native';

interface PrimaryButtonProps extends PressableProps {
    children: React.ReactNode;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    variant?: 'filled' | 'soft' | 'outline' | 'success';
    className?: string;
}

export default function PrimaryButton({
    className = '',
    disabled,
    loading,
    children,
    size = 'md',
    fullWidth = false,
    variant = 'soft',
    onPress,
    ...props
}: PrimaryButtonProps) {
    const sizeClasses = {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
        xl: 'px-8 py-5',
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-base',
        xl: 'text-lg',
    };

    const variantClasses = {
        filled: 'bg-primary-600 dark:bg-primary-600 border-transparent',
        soft: 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800',
        outline: 'bg-transparent border-2 border-primary-600 dark:border-primary-500',
        success: 'bg-green-600 dark:bg-green-600 border-transparent',
    };

    const textColorClasses = {
        filled: 'text-white',
        soft: 'text-primary-700 dark:text-primary-400',
        outline: 'text-primary-600 dark:text-primary-400',
        success: 'text-white',
    };

    const loadingColor = (variant === 'filled' || variant === 'success') ? '#ffffff' : '#4f46e5';

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
                    color={loadingColor}
                />
            ) : (
                typeof children === 'string' ? (
                    <Text
                        className={`
                            font-bold
                            ${textColorClasses[variant]}
                            ${textSizeClasses[size]}
                        `}
                    >
                        {children}
                    </Text>
                ) : (
                    children
                )
            )}
        </Pressable>
    );
}

export function PrimaryButtonIcon({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <View className={`mr-2 ${className}`}>{children}</View>;
}
