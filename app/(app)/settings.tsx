import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useAuthStore } from "../../src/stores/authStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { getTheme, THEME_OPTIONS } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";
import { WidgetCard } from "../../src/shared/components/WidgetCard";
import PrimaryButton from "../../src/shared/components/PrimaryButton";
import DangerButton from "../../src/shared/components/DangerButton";
import { ThemeToggle } from "../../src/shared/components/ThemeToggle";
import { IconES, IconEN, UserIcon, CheckIcon } from "../../src/shared/icons";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
    const { user, logout } = useAuthStore();
    const { theme: themeName, setTheme, locale, setLocale, isDark } = useSettingsStore();
    const theme = getTheme(themeName);
    const { t } = useTranslate();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            t('auth.logout'),
            t('auth.confirm_logout_msg', '¿Estás seguro de que deseas cerrar sesión?'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('auth.logout'), onPress: logout, style: 'destructive' }
            ]
        );
    };

    return (
        <ScrollView 
            className="flex-1 bg-secondary-50 dark:bg-secondary-950"
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="mb-6 mt-2 flex-row items-center justify-between px-1">
                <View>
                    <Text 
                        className="text-3xl font-black tracking-tighter"
                        style={{ color: theme.primary600 }}
                    >
                        {t('common.profile')}
                    </Text>
                    <Text className="text-secondary-500 dark:text-secondary-400 font-medium text-sm">
                        {t('settings.preferences')}
                    </Text>
                </View>
                <ThemeToggle />
            </View>

            {/* User Profile Card */}
            <View className="bg-white dark:bg-secondary-800 rounded-xl p-5 border border-secondary-100 dark:border-secondary-800 shadow-sm mb-6">
                <View className="flex-row items-center">
                    <View
                        className="w-16 h-16 rounded-xl items-center justify-center mr-4 shadow-sm"
                        style={{ backgroundColor: theme.primary600 }}
                    >
                        <UserIcon size={32} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-black text-secondary-900 dark:text-secondary-100 tracking-tight" numberOfLines={1}>
                            {user?.name}
                        </Text>
                        <Text className="text-secondary-500 dark:text-secondary-400 font-medium text-sm" numberOfLines={1}>
                            {user?.email}
                        </Text>
                        <View className="flex-row mt-1.5">
                            <View className="bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 rounded-full border border-primary-100 dark:border-primary-800">
                                <Text className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase">
                                    {t('common.active')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Language Selection */}
            <WidgetCard title={t('common.language')}>
                <View className="flex-row gap-3">
                    <Pressable
                        onPress={() => setLocale('es')}
                        className={`flex-1 flex-row items-center justify-center p-3.5 rounded-xl border-2 active:opacity-70 ${
                            locale === 'es' 
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-600' 
                                : 'bg-secondary-50 dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                        }`}
                    >
                        <IconES size={20} color={locale === 'es' ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                        <Text className={`ml-2.5 font-bold text-base ${locale === 'es' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}>
                            {t('common.spanish')}
                        </Text>
                        {locale === 'es' && <View className="ml-2"><CheckIcon size={14} color={theme.primary600} /></View>}
                    </Pressable>

                    <Pressable
                        onPress={() => setLocale('en')}
                        className={`flex-1 flex-row items-center justify-center p-3.5 rounded-xl border-2 active:opacity-70 ${
                            locale === 'en' 
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-600' 
                                : 'bg-secondary-50 dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                        }`}
                    >
                        <IconEN size={20} color={locale === 'en' ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                        <Text className={`ml-2.5 font-bold text-base ${locale === 'en' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}>
                            {t('common.english')}
                        </Text>
                        {locale === 'en' && <View className="ml-2"><CheckIcon size={14} color={theme.primary600} /></View>}
                    </Pressable>
                </View>
            </WidgetCard>

            {/* Theme Selection - Elegant Circles */}
            <WidgetCard title={t('settings.theme.title')}>
                <Text className="text-secondary-500 dark:text-secondary-400 text-sm mb-5 font-medium leading-4">
                    {t('settings.theme.subtitle')}
                </Text>
                <View className="flex-row flex-wrap justify-center gap-x-5 gap-y-4 px-1">
                    {THEME_OPTIONS.map((option) => (
                        <Pressable
                            key={option.id}
                            onPress={() => setTheme(option.id)}
                            className={`w-12 h-12 rounded-full items-center justify-center border-2 active:scale-90 transition-all ${
                                themeName === option.id 
                                    ? 'border-primary-600 shadow-lg' 
                                    : 'border-secondary-100 dark:border-secondary-800'
                            }`}
                            style={{ backgroundColor: option.color }}
                        >
                            {themeName === option.id && (
                                <View className="bg-black/20 w-full h-full rounded-full items-center justify-center">
                                    <CheckIcon size={20} color="white" />
                                </View>
                            )}
                        </Pressable>
                    ))}
                </View>
            </WidgetCard>

            {/* Account Actions */}
            <View className="gap-3 mt-2">
                <PrimaryButton 
                    onPress={() => router.push('/(app)/profile')} 
                    variant="soft" 
                    size="lg"
                    className="rounded-xl"
                >
                    {t('profile.information')}
                </PrimaryButton>

                <DangerButton
                    onPress={handleLogout}
                    variant="outline"
                    size="lg"
                    className="rounded-xl"
                >
                    {t('auth.logout')}
                </DangerButton>
            </View>
        </ScrollView>
    );
}
