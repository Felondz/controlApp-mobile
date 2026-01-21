import { useState } from "react";
import { useRouter } from "expo-router";
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
import { useAuthStore } from "../../src/stores/authStore";
import { getTheme } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";
import { ThemeToggle } from "../../src/shared/components/ThemeToggle";
import { ApplicationLogo } from "../../src/shared/components/ApplicationLogo";
import PrimaryButton from "../../src/shared/components/PrimaryButton";
import Input from "../../src/shared/components/Input";
import { Checkbox } from "../../src/shared/components/Checkbox";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const { login, isLoading, error, clearError } = useAuthStore();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { t } = useTranslate();
    const insets = useSafeAreaInsets();

    const isTablet = width >= 768;
    const theme = getTheme("purple-modern");

    const handleLogin = async () => {
        if (!email || !password) return;
        const success = await login(email, password, rememberMe);
        if (success) {
            router.replace("/(app)");
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
                                {t('auth.login_subtitle') || 'Ingresa tus credenciales para continuar'}
                            </Text>
                        </View>
                    )}

                    {/* Form Section */}
                    <View
                        className={`flex-1 justify-center px-6 ${isTablet ? "px-16" : "py-8"} relative`}
                    >


                        {/* Logo Header */}
                        {!isTablet && (
                            <View className="items-center mb-8">
                                <ApplicationLogo size={42} showText={true} />
                            </View>
                        )}

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

                        {error && (
                            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <Text className="text-red-600 text-center">{error}</Text>
                                <TouchableOpacity onPress={clearError} className="mt-2">
                                    <Text className="text-red-400 text-center text-sm">
                                        {t('common.close')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <Input
                            label={t('auth.email')}
                            placeholder={t('auth.email_placeholder')}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />

                        <Input
                            label={t('auth.password')}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <View className="mb-6 flex-row justify-between items-center">
                            <Checkbox
                                checked={rememberMe}
                                onChange={setRememberMe}
                                label={t('auth.remember_me')}
                            />

                            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                                <Text
                                    style={{ color: theme.primary600 }}
                                    className="font-medium text-sm"
                                >
                                    {t('auth.forgot_password') || '¿Olvidaste tu contraseña?'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <PrimaryButton
                            onPress={handleLogin}
                            loading={isLoading}
                            className="mb-4"
                        >
                            {t('auth.login_button')}
                        </PrimaryButton>

                        <View className="flex-row justify-center mt-4">
                            <Text className="text-gray-500">{t('auth.dont_have_account')} </Text>
                            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                                <Text
                                    style={{ color: theme.primary600 }}
                                    className="font-semibold"
                                >
                                    {t('auth.register')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
