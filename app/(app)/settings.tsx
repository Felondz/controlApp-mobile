import { View, Text, ScrollView, Switch, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useAuthStore } from "../../src/stores/authStore";
import { getTheme, THEME_OPTIONS } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";

export default function SettingsScreen() {
    const { user, logout } = useAuthStore();
    const [darkMode, setDarkMode] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState("purple-modern");
    const theme = getTheme(selectedTheme);
    const { t } = useTranslate();

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 md:p-6">
                {/* User Section */}
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                    <View className="flex-row items-center">
                        <View
                            className="w-16 h-16 rounded-full items-center justify-center mr-4"
                            style={{ backgroundColor: theme.primary100 }}
                        >
                            <Text style={{ color: theme.primary600 }} className="text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-semibold text-gray-800">{user?.name}</Text>
                            <Text className="text-gray-500">{user?.email}</Text>
                        </View>
                    </View>
                </View>

                {/* Theme Selection */}
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        {t('settings.theme.title')}
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        {THEME_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                className={`w-12 h-12 rounded-full items-center justify-center ${selectedTheme === option.id ? "border-2 border-gray-800" : ""
                                    }`}
                                style={{ backgroundColor: option.color }}
                                onPress={() => setSelectedTheme(option.id)}
                            />
                        ))}
                    </View>
                </View>

                {/* Preferences */}
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        {t('settings.preferences')}
                    </Text>
                    <View className="flex-row items-center justify-between py-2">
                        <Text className="text-gray-700">{t('settings.theme.dark_mode')}</Text>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: "#d1d5db", true: theme.primary400 }}
                            thumbColor={darkMode ? theme.primary600 : "#f3f4f6"}
                        />
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity
                    className="bg-red-500 rounded-xl py-4 items-center"
                    onPress={logout}
                >
                    <Text className="text-white font-semibold text-base">{t('auth.logout')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
