/**
 * PasswordInput Component - Design System
 * Matches web PasswordInput.jsx with show/hide toggle
 */
import React, { useState, forwardRef } from 'react';
import {
    View,
    Text,
    TextInput as RNTextInput,
    TextInputProps as RNTextInputProps,
    TouchableOpacity,
} from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { EyeIcon, EyeOffIcon } from '../icons/index';

export interface PasswordInputProps extends Omit<RNTextInputProps, 'secureTextEntry'> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const PasswordInput = forwardRef<RNTextInput, PasswordInputProps>(
    ({ label, error, containerClassName = '', className = '', ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const { isDark } = useSettingsStore();

        const hasError = !!error;

        return (
            <View className={`mb-4 ${containerClassName}`}>
                {label && (
                    <Text className="text-secondary-700 dark:text-secondary-300 font-medium mb-2 text-base">
                        {label}
                    </Text>
                )}
                <View className="relative">
                    <RNTextInput
                        ref={ref}
                        placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                        secureTextEntry={!showPassword}
                        className={`
                            bg-white dark:bg-secondary-800
                            border rounded-2xl px-5 py-4.5 pr-12 text-base
                            text-secondary-900 dark:text-secondary-100
                            ${hasError 
                                ? 'border-danger-500 dark:border-danger-500' 
                                : 'border-secondary-200 dark:border-secondary-700 focus:border-primary-500'
                            }
                            ${className}
                        `}
                        {...props}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.6}
                        className="absolute right-3 top-0 bottom-0 justify-center p-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {showPassword ? (
                            <EyeOffIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        ) : (
                            <EyeIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        )}
                    </TouchableOpacity>
                </View>
                {error && (
                    <Text className="text-danger-500 text-sm mt-1 ml-1">
                        {error}
                    </Text>
                )}
            </View>
        );
    }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
