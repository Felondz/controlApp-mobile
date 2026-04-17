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
    Alert,
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
import PasswordRequirements from "../../src/shared/components/PasswordRequirements";

export default function RegisterScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const { register, isLoading, error, clearError } = useAuthStore();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { t } = useTranslate();
    const insets = useSafeAreaInsets();

    const isTablet = width >= 768;
    const theme = getTheme("purple-modern");

    const handleRegister = async () => {
        if (!name || !email || !password || !passwordConfirmation) return;
        
        // Paridad con validación web
        const requirements = [
            { isValid: password.length >= 8 },
            { isValid: /[a-zA-Z]/.test(password) },
            { isValid: /[0-9]/.test(password) },
            { isValid: /[a-z]/.test(password) && /[A-Z]/.test(password) }
        ];

        if (requirements.some(req => !req.isValid)) {
            Alert.alert(t('common.error') || "Error", t('auth.password_requirements_error') || "La contraseña no cumple con los requisitos de seguridad.");
            return;
        }

        if (password !== passwordConfirmation) {
            Alert.alert(t('common.error') || "Error", t('auth.passwords_dont_match') || "Las contraseñas no coinciden");
            return;
        }

        const success = await register(name, email, password, passwordConfirmation);
        if (success) {
            Alert.alert(
                t('common.success') || "Éxito", 
                t('auth.registration_success_message') || "Registro exitoso. Por favor verifica tu email.",
                [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
            );
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
                                    <Text className="text-4xl font-black text-white mt-6 tracking-tighter">
                                        Únete a nosotros
                                    </Text>
                                    <Text className="text-lg text-white/70 text-center max-w-xs mt-4 leading-6 font-medium">
                                        Empieza a gestionar tus proyectos de manera profesional hoy mismo.
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View className={`flex-1 justify-center px-8 ${isTablet ? "px-20" : "py-12"}`}>
                            {!isTablet && (
                                <View className="items-center mb-10">
                                    <ApplicationLogo size={56} showText={true} />
                                </View>
                            )}

                            <View className="mb-8">
                                <Text className="text-4xl font-black text-secondary-900 dark:text-secondary-50 tracking-tighter mb-2">
                                    {t('auth.create_account')}
                                </Text>
                                <Text className="text-lg text-secondary-500 dark:text-secondary-400 font-medium">
                                    {t('auth.register_subtitle')}
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
                                label={t('auth.name')}
                                placeholder={t('auth.name_placeholder')}
                                value={name}
                                onChangeText={setName}
                                autoComplete="name"
                                returnKeyType="next"
                            />

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
                                autoComplete="password-new"
                                returnKeyType="next"
                            />

                            <PasswordRequirements password={password} />

                            <PasswordInput
                                label={t('auth.confirm_password')}
                                placeholder="••••••••"
                                value={passwordConfirmation}
                                onChangeText={setPasswordConfirmation}
                                autoComplete="password-new"
                                returnKeyType="done"
                                onSubmitEditing={handleRegister}
                            />

                            {/* Botones organizados con paridad web */}
                            <View className="mt-6 flex-row items-center gap-4">
                                <SecondaryButton 
                                    onPress={() => router.push("/(auth)/login")}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                >
                                    {t('auth.cancel') || 'Cancelar'}
                                </SecondaryButton>
                                <PrimaryButton
                                    onPress={handleRegister}
                                    loading={isLoading}
                                    variant="filled"
                                    size="lg"
                                    className="flex-1 shadow-xl shadow-primary-600/20"
                                >
                                    {t('auth.register_button')}
                                </PrimaryButton>
                            </View>

                            <View className="mt-10 flex-row justify-center items-center">
                                <View className="h-[1px] flex-1 bg-secondary-200 dark:bg-secondary-800" />
                                <Text className="mx-4 text-sm font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">
                                    {t('auth.already_have_account')}
                                </Text>
                                <View className="h-[1px] flex-1 bg-secondary-200 dark:bg-secondary-800" />
                            </View>

                            <SecondaryButton 
                                onPress={() => router.push("/(auth)/login")}
                                variant="outline"
                                size="lg"
                                className="mt-8 py-4"
                            >
                                {t('auth.login')}
                            </SecondaryButton>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}
