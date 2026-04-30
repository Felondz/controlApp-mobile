/**
 * Register Screen Component
 * Responsive design for phone and tablet
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { getTheme } from '../../shared/themes';
import { useTranslate } from '../../shared/hooks/useTranslate';
import PrimaryButton from '../../shared/components/PrimaryButton';
import SecondaryButton from '../../shared/components/SecondaryButton';
import Input from '../../shared/components/Input';

interface RegisterScreenProps {
    onNavigateToLogin?: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
    const { t } = useTranslate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const { register, isLoading, error, clearError } = useAuthStore();
    const { width } = useWindowDimensions();

    const isTablet = width >= 768;
    const theme = getTheme('purple-modern');

    const handleRegister = async () => {
        if (!name || !email || !password || !passwordConfirmation) {
            return;
        }
        if (password !== passwordConfirmation) {
            return;
        }
        await register(name, email, password, passwordConfirmation);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-50"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className={`flex-1 ${isTablet ? 'flex-row' : ''}`}>
                    {/* Branding Section - tablet only */}
                    {isTablet && (
                        <View
                            className="flex-1 justify-center items-center p-12"
                            style={{ backgroundColor: theme.primary500 }}
                        >
                            <Text className="text-5xl font-bold text-white mb-4">
                                {t('app.name')}
                            </Text>
                            <Text className="text-xl text-white/80 text-center">
                                {t('auth.register_subtitle')}
                            </Text>
                        </View>
                    )}

                    {/* Form Section */}
                    <View className={`flex-1 justify-center px-6 ${isTablet ? 'px-16' : 'py-8'}`}>
                        {/* Mobile header */}
                        {!isTablet && (
                            <View className="items-center mb-6">
                                <Text
                                    className="text-4xl font-bold mb-2"
                                    style={{ color: theme.primary600 }}
                                >
                                    {t('app.name')}
                                </Text>
                                <Text className="text-gray-500 text-base">
                                    {t('auth.register_subtitle')}
                                </Text>
                            </View>
                        )}

                        {/* Tablet header */}
                        {isTablet && (
                            <View className="mb-6">
                                <Text className="text-3xl font-bold text-gray-800 mb-2">
                                    {t('auth.create_account')}
                                </Text>
                                <Text className="text-gray-500 text-base">
                                    {t('auth.register_subtitle')}
                                </Text>
                            </View>
                        )}

                        {/* Error message */}
                        {error && (
                            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <Text className="text-red-600 text-center">{error}</Text>
                                <SecondaryButton 
                                    onPress={clearError} 
                                    variant="ghost" 
                                    size="sm"
                                    className="mt-2"
                                >
                                    {t('common.cancel')}
                                </SecondaryButton>
                            </View>
                        )}

                        {/* Name Input */}
                        <Input
                            label={t('auth.name')}
                            placeholder={t('auth.name_placeholder')}
                            value={name}
                            onChangeText={setName}
                            autoComplete="name"
                            className="mb-4"
                        />

                        {/* Email Input */}
                        <Input
                            label={t('auth.email')}
                            placeholder={t('auth.email_placeholder')}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            className="mb-4"
                        />

                        {/* Password Input */}
                        <Input
                            label={t('auth.password')}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password-new"
                            className="mb-4"
                        />

                        {/* Confirm Password Input */}
                        <Input
                            label={t('auth.confirm_password')}
                            placeholder="••••••••"
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                            secureTextEntry
                            autoComplete="password-new"
                            className="mb-6"
                        />

                        {/* Register Button */}
                        <PrimaryButton
                            variant="filled"
                            onPress={handleRegister}
                            loading={isLoading}
                            fullWidth
                            size="lg"
                            className="mb-4"
                        >
                            {t('auth.register_button')}
                        </PrimaryButton>

                        {/* Login Link */}
                        <View className="flex-row justify-center mt-4">
                            <Text className="text-gray-500">{t('auth.already_have_account')} </Text>
                            <SecondaryButton 
                                variant="ghost" 
                                size="sm" 
                                onPress={onNavigateToLogin}
                                className="p-0 h-auto"
                            >
                                <Text style={{ color: theme.primary600 }} className="font-bold">
                                    {t('auth.login')}
                                </Text>
                            </SecondaryButton>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
