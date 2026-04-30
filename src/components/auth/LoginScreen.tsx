/**
 * Login Screen Component
 * Responsive design for phone and tablet
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../../stores/authStore';
import { getTheme } from '../../shared/themes';
import { useTranslate } from '../../shared/hooks/useTranslate';
import PrimaryButton, { PrimaryButtonIcon } from '../../shared/components/PrimaryButton';
import SecondaryButton from '../../shared/components/SecondaryButton';
import Input from '../../shared/components/Input';
import { GoogleIcon } from '../../shared/icons';

WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
    onNavigateToRegister?: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
    const { t } = useTranslate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
    const { width } = useWindowDimensions();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        });
    }, []);

    // Responsive: tablet uses split layout
    const isTablet = width >= 768;
    const theme = getTheme('purple-modern');

    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.idToken || (userInfo as any).data?.idToken;
            
            if (idToken) {
                await loginWithGoogle(idToken);
            }
        } catch (error: any) {
            console.error('[LoginScreen] Google Sign-In Error:', error);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            return;
        }
        await login(email, password, false);
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
                    {/* Branding Section - visible on tablet as left side */}
                    {isTablet && (
                        <View
                            className="flex-1 justify-center items-center p-12"
                            style={{ backgroundColor: theme.primary500 }}
                        >
                            <Text className="text-5xl font-bold text-white mb-4">
                                {t('app.name')}
                            </Text>
                            <Text className="text-xl text-white/80 text-center">
                                {t('landing.hero_subtitle')}
                            </Text>
                        </View>
                    )}

                    {/* Form Section */}
                    <View className={`flex-1 justify-center px-6 ${isTablet ? 'px-16' : 'py-12'}`}>
                        {/* Mobile header */}
                        {!isTablet && (
                            <View className="items-center mb-8">
                                <Text
                                    className="text-4xl font-bold mb-2"
                                    style={{ color: theme.primary600 }}
                                >
                                    {t('app.name')}
                                </Text>
                                <Text className="text-gray-500 text-base">
                                    {t('auth.login_subtitle')}
                                </Text>
                            </View>
                        )}

                        {/* Tablet header */}
                        {isTablet && (
                            <View className="mb-8">
                                <Text className="text-3xl font-bold text-gray-800 mb-2">
                                    {t('auth.welcome_back')}
                                </Text>
                                <Text className="text-gray-500 text-base">
                                    {t('auth.login_subtitle')}
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
                            autoComplete="password"
                            className="mb-6"
                        />

                        {/* Login Button */}
                        <PrimaryButton
                            variant="filled"
                            onPress={handleLogin}
                            loading={isLoading}
                            fullWidth
                            size="lg"
                            className="mb-4"
                        >
                            {t('auth.login_button')}
                        </PrimaryButton>

                        {/* Separator */}
                        <View className="flex-row items-center my-4">
                            <View className="flex-1 h-[1px] bg-gray-200" />
                            <Text className="mx-4 text-gray-400 text-sm font-medium">
                                {t('auth.or_continue_with')}
                            </Text>
                            <View className="flex-1 h-[1px] bg-gray-200" />
                        </View>

                        {/* Google Login Button */}
                        <SecondaryButton
                            variant="outline"
                            onPress={handleGoogleLogin}
                            disabled={isLoading}
                            fullWidth
                            size="lg"
                            className="mb-6 flex-row items-center justify-center"
                        >
                            <View className="mr-3">
                                <GoogleIcon size={20} />
                            </View>
                            <Text className="font-semibold text-secondary-700">
                                {t('auth.login_google')}
                            </Text>
                        </SecondaryButton>

                        {/* Register Link */}
                        <View className="flex-row justify-center mt-4">
                            <Text className="text-gray-500">{t('auth.dont_have_account')} </Text>
                            <SecondaryButton 
                                variant="ghost" 
                                size="sm" 
                                onPress={onNavigateToRegister}
                                className="p-0 h-auto"
                            >
                                <Text style={{ color: theme.primary600 }} className="font-bold">
                                    {t('auth.register')}
                                </Text>
                            </SecondaryButton>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
