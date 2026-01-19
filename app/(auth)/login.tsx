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
import { useAuthStore } from "../../src/stores/authStore";
import { getTheme } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, isLoading, error, clearError } = useAuthStore();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { t } = useTranslate();

    const isTablet = width >= 768;
    const theme = getTheme("purple-modern");

    const handleLogin = async () => {
        if (!email || !password) return;
        const success = await login(email, password);
        if (success) {
            router.replace("/(app)");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-gray-50"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className={`flex-1 ${isTablet ? "flex-row" : ""}`}>
                    {/* Branding - Tablet only */}
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

                    {/* Form */}
                    <View
                        className={`flex-1 justify-center px-6 ${isTablet ? "px-16" : "py-12"}`}
                    >
                        {!isTablet && (
                            <View className="items-center mb-8">
                                <Text
                                    className="text-4xl font-bold mb-2"
                                    style={{ color: theme.primary600 }}
                                >
                                    ControlApp
                                </Text>
                                <Text className="text-gray-500 text-base">
                                    {t('auth.login_subtitle')}
                                </Text>
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

                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium mb-2">
                                {t('auth.email')}
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
                                placeholder={t('auth.email_placeholder')}
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-gray-700 font-medium mb-2">
                                {t('auth.password')}
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
                                placeholder="••••••••"
                                placeholderTextColor="#9ca3af"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password"
                            />
                        </View>

                        <TouchableOpacity
                            className="rounded-xl py-4 items-center mb-4"
                            style={{ backgroundColor: theme.primary500 }}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-semibold text-lg">
                                    {t('auth.login_button')}
                                </Text>
                            )}
                        </TouchableOpacity>

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
