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

export default function RegisterScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const { register, isLoading, error, clearError } = useAuthStore();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { t } = useTranslate();

    const isTablet = width >= 768;
    const theme = getTheme("purple-modern");

    const handleRegister = async () => {
        if (!name || !email || !password || !passwordConfirmation) return;
        if (password !== passwordConfirmation) return;
        const success = await register(name, email, password, passwordConfirmation);
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
                    {isTablet && (
                        <View
                            className="flex-1 justify-center items-center p-12"
                            style={{ backgroundColor: theme.primary500 }}
                        >
                            <Text className="text-5xl font-bold text-white mb-4">
                                ControlApp
                            </Text>
                            <Text className="text-xl text-white/80 text-center">
                                {t('auth.register_tagline')}
                            </Text>
                        </View>
                    )}

                    <View
                        className={`flex-1 justify-center px-6 ${isTablet ? "px-16" : "py-8"}`}
                    >
                        {!isTablet && (
                            <View className="items-center mb-6">
                                <Text
                                    className="text-4xl font-bold mb-2"
                                    style={{ color: theme.primary600 }}
                                >
                                    ControlApp
                                </Text>
                                <Text className="text-gray-500 text-base">
                                    {t('auth.create_account')}
                                </Text>
                            </View>
                        )}

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
                                {t('auth.name')}
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
                                placeholder={t('auth.name_placeholder')}
                                placeholderTextColor="#9ca3af"
                                value={name}
                                onChangeText={setName}
                                autoComplete="name"
                            />
                        </View>

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

                        <View className="mb-4">
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
                                autoComplete="password-new"
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-gray-700 font-medium mb-2">
                                {t('auth.confirm_password')}
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
                                placeholder="••••••••"
                                placeholderTextColor="#9ca3af"
                                value={passwordConfirmation}
                                onChangeText={setPasswordConfirmation}
                                secureTextEntry
                                autoComplete="password-new"
                            />
                        </View>

                        <TouchableOpacity
                            className="rounded-xl py-4 items-center mb-4"
                            style={{ backgroundColor: theme.primary500 }}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-semibold text-lg">
                                    {t('auth.register_button')}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-4">
                            <Text className="text-gray-500">{t('auth.already_have_account')} </Text>
                            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                                <Text
                                    style={{ color: theme.primary600 }}
                                    className="font-semibold"
                                >
                                    {t('auth.login')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
