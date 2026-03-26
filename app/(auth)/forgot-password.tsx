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
import { getTheme } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";
import { ThemeToggle } from "../../src/shared/components/ThemeToggle";
import { ApplicationLogo } from "../../src/shared/components/ApplicationLogo";
import { authApi } from "../../src/services/api";
import PrimaryButton from "../../src/shared/components/PrimaryButton";
import Input from "../../src/shared/components/Input";
import { ChevronLeftIcon } from "../../src/shared/icons";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { t } = useTranslate();
    const insets = useSafeAreaInsets();

    const theme = getTheme("purple-modern");
    const isTablet = width >= 768;

    const handleSubmit = async () => {
        if (!email) {
            setError(t('validation.required') || 'El email es requerido');
            return;
        }

        setIsLoading(true);
        setError(null);
        setStatus(null);

        try {
            await authApi.forgotPassword(email);
            setStatus(t('auth.verification_link_sent') || 'Enlace enviado.');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.email?.[0] || t('common.error'));
        } finally {
            setIsLoading(false);
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
                                    <Text className="text-4xl font-black text-white mt-6 tracking-tighter text-center">
                                        Recuperación
                                    </Text>
                                    <Text className="text-lg text-white/70 text-center max-w-xs mt-4 leading-6 font-medium">
                                        No te preocupes, te ayudaremos a volver a entrar en un momento.
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View className={`flex-1 justify-center px-8 ${isTablet ? "px-20" : "py-12"}`}>
                            <TouchableOpacity 
                                onPress={() => router.back()}
                                className="flex-row items-center mb-8"
                            >
                                <ChevronLeftIcon size={20} color={theme.primary600} />
                                <Text className="ml-1 font-bold text-sm" style={{ color: theme.primary600 }}>
                                    {t('auth.back_to_login')}
                                </Text>
                            </TouchableOpacity>

                            <View className="mb-10">
                                <Text className="text-4xl font-black text-secondary-900 dark:text-secondary-50 tracking-tighter mb-2">
                                    {t('auth.forgot_password_title')}
                                </Text>
                                <Text className="text-lg text-secondary-500 dark:text-secondary-400 font-medium leading-6">
                                    {t('auth.forgot_password_description')}
                                </Text>
                            </View>

                            {status && (
                                <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mb-8">
                                    <Text className="text-green-700 dark:text-green-400 font-bold text-sm text-center leading-5">
                                        {status}
                                    </Text>
                                </View>
                            )}

                            {error && (
                                <View className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-2xl p-5 mb-8">
                                    <Text className="text-danger-600 dark:text-danger-400 font-bold text-sm text-center">
                                        {error}
                                    </Text>
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
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                            />

                            <PrimaryButton
                                onPress={handleSubmit}
                                loading={isLoading}
                                variant="filled"
                                size="lg"
                                className="mt-4 shadow-xl shadow-primary-600/20"
                            >
                                {t('auth.forgot_password_submit')}
                            </PrimaryButton>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}
