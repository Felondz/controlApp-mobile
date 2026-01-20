import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTheme } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";
import { ThemeToggle } from "../../src/shared/components/ThemeToggle";
import { ApplicationLogo } from "../../src/shared/components/ApplicationLogo";
import { authApi } from "../../src/services/api";
import PrimaryButton from "../../src/shared/components/PrimaryButton";
import Input from "../../src/shared/components/Input";

export default function ResetPasswordScreen() {
    const { token, email: initialEmail } = useLocalSearchParams<{ token: string; email: string }>();
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { t } = useTranslate();
    const insets = useSafeAreaInsets();

    const isTablet = width >= 768;
    const theme = getTheme("purple-modern");

    const handleSubmit = async () => {
        if (!password || !passwordConfirmation) {
            setError(t('validation.required') || 'Todos los campos son requeridos');
            return;
        }

        if (password !== passwordConfirmation) {
            setError(t('validation.password_mismatch') || 'Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        setError(null);
        setStatus(null);

        try {
            await authApi.resetPassword({
                token,
                email: initialEmail,
                password,
                password_confirmation: passwordConfirmation,
            });
            setStatus(t('auth.password_reset_success') || 'Contraseña restablecida correctamente.');
            setTimeout(() => {
                router.replace("/(auth)/login");
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-gray-50 dark:bg-gray-900 relative"
        >
            {/* Theme Toggle - Fixed Top Right */}
            {/* Theme Toggle - Fixed Top Right with Safe Area */}
            <View
                style={{
                    position: 'absolute',
                    top: insets.top + 10,
                    right: 20,
                    zIndex: 50
                }}
            >
                <ThemeToggle />
            </View>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
                keyboardShouldPersistTaps="handled"
            >
                <View className={`flex-1 ${isTablet ? "flex-row" : ""}`}>
                    {/* Hero Section (Tablet Only) */}
                    {isTablet && (
                        <View
                            className="flex-1 justify-center items-center p-12"
                            style={{ backgroundColor: theme.primary500 }}
                        >
                            <Text className="text-5xl font-bold text-white mb-4">
                                ControlApp
                            </Text>
                            <Text className="text-xl text-white/80 text-center">
                                {t('common.app_tagline')}
                            </Text>
                        </View>
                    )}

                    {/* Form Section */}
                    <View
                        className={`flex-1 justify-center px-6 ${isTablet ? "px-16" : "py-8"} relative`}
                    >


                        {!isTablet && (
                            <View className="items-center mb-8">
                                <ApplicationLogo size={42} showText={true} />
                            </View>
                        )}

                        <View className="mb-6">
                            <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                {t('auth.reset_password_title') || 'Restablecer Contraseña'}
                            </Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-base leading-6">
                                {t('auth.reset_password_instructions') || 'Ingresa tu nueva contraseña.'}
                            </Text>
                        </View>

                        {/* Status Message */}
                        {status && (
                            <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                                <Text className="text-green-700 dark:text-green-400 font-medium text-center">
                                    {status}
                                </Text>
                            </View>
                        )}

                        {/* Error Message */}
                        {error && (
                            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                                <Text className="text-red-600 dark:text-red-400 text-center">{error}</Text>
                            </View>
                        )}

                        <Input
                            label={t('auth.new_password') || 'Nueva Contraseña'}
                            placeholder={t('auth.password_placeholder') || '••••••••'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <Input
                            label={t('auth.confirm_password') || 'Confirmar Contraseña'}
                            placeholder={t('auth.password_placeholder') || '••••••••'}
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                            secureTextEntry
                            autoCapitalize="none"
                            className="mb-6"
                        />

                        <PrimaryButton
                            onPress={handleSubmit}
                            loading={isLoading}
                            className="mb-6"
                        >
                            {t('auth.reset_password_submit') || 'Restablecer Contraseña'}
                        </PrimaryButton>

                        <View className="flex-row justify-center">
                            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                                <Text
                                    style={{ color: theme.primary600 }}
                                    className="font-medium text-base"
                                >
                                    {t('auth.back_to_login')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
