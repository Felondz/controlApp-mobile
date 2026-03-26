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
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="mb-8 flex-row items-center justify-between">
                <View>
                    <Text className="text-3xl font-black text-secondary-900 dark:text-secondary-100 tracking-tighter">
                        {t('common.profile')}
                    </Text>
                    <Text className="text-secondary-500 dark:text-secondary-400 font-medium">
                        {t('settings.preferences')}
                    </Text>
                </View>
                <ThemeToggle />
            </View>

            {/* User Profile Card */}
            <View className="bg-white dark:bg-secondary-800 rounded-[32px] p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm mb-6">
                <View className="flex-row items-center">
                    <View
                        className="w-20 h-20 rounded-3xl items-center justify-center mr-5 shadow-lg shadow-primary-600/20"
                        style={{ backgroundColor: theme.primary600 }}
                    >
                        <UserIcon size={40} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xl font-black text-secondary-900 dark:text-secondary-100 tracking-tight" numberOfLines={1}>
                            {user?.name}
                        </Text>
                        <Text className="text-secondary-500 dark:text-secondary-400 font-medium" numberOfLines={1}>
                            {user?.email}
                        </Text>
                        <View className="flex-row mt-2">
                            <View className="bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800">
                                <Text className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase">
                                    {t('common.active')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Language Selection */}
            <WidgetCard title={t('common.language')}>
                <View className="flex-row gap-4">
                    <Pressable
                        onPress={() => setLocale('es')}
                        className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2 active:opacity-70 ${
                            locale === 'es' 
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-600' 
                                : 'bg-secondary-50 dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                        }`}
                    >
                        <IconES size={24} color={locale === 'es' ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                        <Text className={`ml-3 font-bold ${locale === 'es' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}>
                            {t('common.spanish')}
                        </Text>
                        {locale === 'es' && <View className="ml-2"><CheckIcon size={16} color={theme.primary600} /></View>}
                    </Pressable>

                    <Pressable
                        onPress={() => setLocale('en')}
                        className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2 active:opacity-70 ${
                            locale === 'en' 
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-600' 
                                : 'bg-secondary-50 dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                        }`}
                    >
                        <IconEN size={24} color={locale === 'en' ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                        <Text className={`ml-3 font-bold ${locale === 'en' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}>
                            {t('common.english')}
                        </Text>
                        {locale === 'en' && <View className="ml-2"><CheckIcon size={16} color={theme.primary600} /></View>}
                    </Pressable>
                </View>
            </WidgetCard>

            {/* Theme Selection */}
            <WidgetCard title={t('settings.theme.title')}>
                <Text className="text-secondary-500 dark:text-secondary-400 text-xs mb-4 font-medium">
                    {t('settings.theme.subtitle')}
                </Text>
                <View className="flex-row flex-wrap gap-4 justify-between">
                    {THEME_OPTIONS.map((option) => (
                        <Pressable
                            key={option.id}
                            onPress={() => setTheme(option.id)}
                            className={`w-[30%] aspect-square rounded-3xl items-center justify-center border-4 active:scale-95 transition-all ${
                                themeName === option.id 
                                    ? 'border-primary-600' 
                                    : 'border-white dark:border-secondary-800 shadow-sm'
                            }`}
                            style={{ backgroundColor: option.color }}
                        >
                            {themeName === option.id && (
                                <View className="bg-white/30 rounded-full p-1">
                                    <CheckIcon size={24} color="white" />
                                </View>
                            )}
                        </Pressable>
                    ))}
                </View>
            </WidgetCard>

            {/* Account Actions */}
            <View className="gap-4 mt-4">
                <PrimaryButton 
                    onPress={() => {}} 
                    variant="soft" 
                    size="lg"
                >
                    {t('profile.information')}
                </PrimaryButton>

                <DangerButton
                    onPress={handleLogout}
                    variant="outline"
                    size="lg"
                >
                    {t('auth.logout')}
                </DangerButton>
            </View>
        </ScrollView>
    );
}
