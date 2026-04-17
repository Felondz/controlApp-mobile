import { useState } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/stores/authStore";
import { getTheme } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";
import { ThemeToggle } from "../../src/shared/components/ThemeToggle";
import { ApplicationLogo } from "../../src/shared/components/ApplicationLogo";
import PrimaryButton from "../../src/shared/components/PrimaryButton";
import SecondaryButton from "../../src/shared/components/SecondaryButton";
import Input from "../../src/shared/components/Input";
import PasswordInput from "../../src/shared/components/PasswordInput";
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 bg-secondary-50 dark:bg-secondary-950"
            >
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
                    showsVerticalScrollIndicator={false}
                >
                    <View className={`flex-1 ${isTablet ? "flex-row" : ""}`}>
                        {isTablet && (
                            <View
                                className="flex-1 justify-center items-center p-12"
                                style={{ backgroundColor: theme.primary600 }}
                            >
                                <View className="bg-white/10 p-8 rounded-[40px] backdrop-blur-md border border-white/20 items-center">
                                    <ApplicationLogo size={80} color="white" showText={false} />
                                    <Text className="text-5xl font-black text-white mt-6 tracking-tighter">
                                        ControlApp
                                    </Text>
                                    <Text className="text-xl text-white/70 text-center max-w-xs mt-4 leading-7">
                                        {t('landing.hero_subtitle') || 'La solución completa para tus proyectos.'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View className={`flex-1 justify-center px-8 ${isTablet ? "px-20" : "py-12"}`}>
                            {!isTablet && (
                                <View className="items-center mb-12">
                                    <ApplicationLogo size={56} showText={true} />
                                </View>
                            )}

                            <View className="mb-10">
                                <Text className="text-4xl font-black text-secondary-900 dark:text-secondary-50 tracking-tighter mb-2">
                                    {t('auth.welcome_back')}
                                </Text>
                                <Text className="text-lg text-secondary-500 dark:text-secondary-400 font-medium">
                                    {t('auth.login_subtitle')}
                                </Text>
                            </View>

                            {error && (
                                <View className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-2xl p-4 mb-8">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-danger-600 dark:text-danger-400 flex-1 font-bold text-base">
                                            {error}
                                        </Text>
                                        <TouchableOpacity onPress={clearError} className="ml-2 bg-danger-100 dark:bg-danger-800 p-1.5 rounded-lg">
                                            <Text className="text-danger-600 dark:text-danger-400 font-black text-sm">✕</Text>
                                        </TouchableOpacity>
                                    </View>
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
                                returnKeyType="next"
                            />

                            <PasswordInput
                                label={t('auth.password')}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />

                            <View className="mb-10 flex-row justify-between items-center">
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={setRememberMe}
                                    label={t('auth.remember_me')}
                                />

                                <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                                    <Text
                                        className="font-bold text-base"
                                        style={{ color: theme.primary600 }}
                                    >
                                        {t('auth.forgot_password')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <PrimaryButton
                                onPress={handleLogin}
                                loading={isLoading}
                                variant="filled"
                                size="xl"
                                className="mb-8 shadow-xl shadow-primary-600/30"
                            >
                                {t('auth.login_button')}
                            </PrimaryButton>

                            <View className="flex-row justify-center items-center">
                                <View className="h-[1px] flex-1 bg-secondary-200 dark:bg-secondary-800" />
                                <Text className="mx-4 text-sm font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">
                                    {t('auth.dont_have_account')}
                                </Text>
                                <View className="h-[1px] flex-1 bg-secondary-200 dark:bg-secondary-800" />
                            </View>

                            <SecondaryButton 
                                onPress={() => router.push("/(auth)/register")}
                                variant="outline"
                                size="lg"
                                className="mt-8 py-4"
                            >
                                {t('auth.register')}
                            </SecondaryButton>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}
