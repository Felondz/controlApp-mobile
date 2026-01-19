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
    ViewStyle,
} from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTheme } from '../themes';
import { EyeIcon, EyeOffIcon } from '../icons/index';

export interface PasswordInputProps extends Omit<RNTextInputProps, 'secureTextEntry'> {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export const PasswordInput = forwardRef<RNTextInput, PasswordInputProps>(
    ({ label, error, containerStyle, style, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const { theme: themeId } = useSettingsStore();
        const theme = getTheme(themeId);

        const hasError = !!error;

        return (
            <View style={containerStyle}>
                {label && (
                    <Text
                        style={{
                            color: '#374151',
                            fontWeight: '500',
                            marginBottom: 8,
                            fontSize: 14,
                        }}
                    >
                        {label}
                    </Text>
                )}
                <View style={{ position: 'relative' }}>
                    <RNTextInput
                        ref={ref}
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showPassword}
                        style={[
                            {
                                backgroundColor: '#ffffff',
                                borderWidth: 1,
                                borderColor: hasError ? '#ef4444' : '#e5e7eb',
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                                paddingRight: 50,
                                fontSize: 16,
                                color: '#1f2937',
                            },
                            style,
                        ]}
                        {...props}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            padding: 4,
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {showPassword ? (
                            <EyeOffIcon size={20} color="#6b7280" />
                        ) : (
                            <EyeIcon size={20} color="#6b7280" />
                        )}
                    </TouchableOpacity>
                </View>
                {error && (
                    <Text
                        style={{
                            color: '#ef4444',
                            fontSize: 12,
                            marginTop: 4,
                        }}
                    >
                        {error}
                    </Text>
                )}
            </View>
        );
    }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
