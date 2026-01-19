/**
 * TextInput Component - Design System
 * Matches web TextInput.jsx with label and error support
 */
import React, { forwardRef } from 'react';
import {
    View,
    Text,
    TextInput as RNTextInput,
    TextInputProps as RNTextInputProps,
    ViewStyle,
} from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTheme } from '../themes';

export interface TextInputProps extends RNTextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
    ({ label, error, containerStyle, style, ...props }, ref) => {
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
                <RNTextInput
                    ref={ref}
                    placeholderTextColor="#9ca3af"
                    style={[
                        {
                            backgroundColor: '#ffffff',
                            borderWidth: 1,
                            borderColor: hasError ? '#ef4444' : '#e5e7eb',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            fontSize: 16,
                            color: '#1f2937',
                        },
                        style,
                    ]}
                    {...props}
                />
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

TextInput.displayName = 'TextInput';

export default TextInput;
