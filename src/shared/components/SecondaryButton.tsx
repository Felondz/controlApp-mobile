import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';

interface SecondaryButtonProps extends PressableProps {
    children: React.ReactNode;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    variant?: 'default' | 'outline' | 'ghost';
    className?: string;
}

export default function SecondaryButton({
    className = '',
    disabled,
    loading,
    children,
    size = 'md',
    fullWidth = false,
    variant = 'default',
    onPress,
    ...props
}: SecondaryButtonProps) {
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
        default: 'bg-secondary-100 dark:bg-secondary-800 border-transparent',
        outline: 'bg-transparent border-2 border-secondary-200 dark:border-secondary-700',
        ghost: 'bg-transparent border-transparent',
    };

    const textColorClasses = {
        default: 'text-secondary-700 dark:text-secondary-200',
        outline: 'text-secondary-600 dark:text-secondary-300',
        ghost: 'text-secondary-500 dark:text-secondary-400',
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            className={`
                flex-row items-center justify-center rounded-2xl border active:opacity-70
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
                    color="#6b7280"
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
