import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { authApi } from '../../src/services/api';
import { getTheme } from '../../src/shared/themes';
import { useTranslate } from '../../src/shared/hooks';
import { ApplicationLogo } from "../../src/shared/components/ApplicationLogo";
import PrimaryButton from "../../src/shared/components/PrimaryButton";
import SecondaryButton from "../../src/shared/components/SecondaryButton";

export default function VerifyEmailScreen() {
    const { id, hash, expires, signature } = useLocalSearchParams<{ id: string; hash: string; expires: string; signature: string }>();
    const router = useRouter();
    const theme = getTheme('purple-modern');
    const { t } = useTranslate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState(t('auth.verifying_email') || 'Verificando tu correo electrónico...');

    useEffect(() => {
        if (!id || !hash || !expires || !signature) {
            setStatus('error');
            setMessage(t('auth.verification_invalid_link') || 'Enlace de verificación inválido.');
            return;
        }

        verifyEmail();
    }, [id, hash, expires, signature]);

    const verifyEmail = async () => {
        try {
            await authApi.verifyEmail(id, hash, expires, signature);
            setStatus('success');
            setMessage(t('auth.verification_success') || '¡Correo verificado exitosamente!');
        } catch (error: any) {
            console.error('Verification error:', error);
            setStatus('error');
            setMessage(error.response?.data?.message || t('auth.verification_error') || 'Error al verificar el correo.');
        }
    };

    const handleContinue = () => {
        router.replace('/(auth)/login');
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900 px-6">
            <View className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm w-full max-w-sm items-center">
                {status === 'verifying' && (
                    <>
                        <ActivityIndicator size="large" color={theme.primary500} className="mb-4" />
                        <Text className="text-gray-600 dark:text-gray-300 text-center text-lg">{message}</Text>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                            <Text className="text-3xl">✅</Text>
                        </View>
                        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('auth.verified_title') || '¡Verificado!'}</Text>
                        <Text className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</Text>

                        <PrimaryButton
                            onPress={handleContinue}
                            className="w-full"
                        >
                            {t('auth.go_to_login') || 'Ir a Iniciar Sesión'}
                        </PrimaryButton>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                            <Text className="text-3xl">⚠️</Text>
                        </View>
                        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('auth.error_title') || 'Error'}</Text>
                        <Text className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</Text>

                        <SecondaryButton
                            onPress={() => router.replace('/(auth)/login')}
                            className="w-full"
                        >
                            {t('auth.back_to_login') || 'Volver al Login'}
                        </SecondaryButton>
                    </>
                )}
            </View>
        </View>
    );
}
