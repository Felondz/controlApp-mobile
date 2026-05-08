import React from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAppTheme } from '../hooks';

interface InputProps extends RNTextInputProps {
    label?: string;
    error?: string;
    description?: string;
    containerClassName?: string;
    icon?: React.ElementType;
    required?: boolean;
}

export default function Input({ 
    label, 
    error, 
    description, 
    className = '', 
    containerClassName = '', 
    icon: Icon,
    required,
    ...props 
}: InputProps) {
    const { isDark } = useSettingsStore();
    const { theme } = useAppTheme();
    const hasError = !!error;

    return (
        <View className={`mb-4 ${containerClassName}`}>
            {label && (
                <Text className="text-secondary-700 dark:text-secondary-300 font-medium mb-1.5 text-base">
                    {label}
                    {required && <Text className="text-danger-500 ml-1">*</Text>}
                </Text>
            )}
            
            {description ? (
                <Text className="text-secondary-500 dark:text-secondary-400 text-xs mb-2 leading-4">
                    {description}
                </Text>
            ) : null}

            <View className="relative justify-center">
                {Icon && (
                    <View className="absolute left-5 z-10">
                        <Icon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </View>
                )}
                
                <RNTextInput
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    style={{ textAlignVertical: props.multiline ? 'top' : 'center' }}
                    className={`
                        bg-white dark:bg-secondary-800/50
                        border rounded-2xl px-5 py-4 text-base
                        text-secondary-900 dark:text-secondary-100
                        ${Icon ? 'pl-12' : 'px-5'}
                        ${hasError 
                            ? 'border-danger-500 dark:border-danger-500' 
                            : 'border-secondary-200 dark:border-secondary-700 focus:border-primary-500'
                        }
                        ${className}
                    `}
                    {...props}
                />
            </View>

            {error && <Text className="text-danger-500 text-[11px] mt-1.5 ml-1 font-medium">{error}</Text>}
        </View>
    );
}
