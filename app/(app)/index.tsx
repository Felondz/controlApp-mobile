import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../src/stores/authStore";
import { getTheme } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";

export default function DashboardScreen() {
    const { user, logout } = useAuthStore();
    const theme = getTheme("purple-modern");
    const { t } = useTranslate();

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 md:p-6">
                {/* Welcome Header */}
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-800">
                        {t('dashboard.welcome', { name: user?.name || '' })} 👋
                    </Text>
                    <Text className="text-gray-500 mt-1">
                        {t('dashboard.subtitle')}
                    </Text>
                </View>

                {/* Quick Stats Placeholder */}
                <View className="flex-row flex-wrap gap-4 mb-6">
                    <View
                        className="flex-1 min-w-[140px] p-4 rounded-xl"
                        style={{ backgroundColor: theme.primary50 }}
                    >
                        <Text style={{ color: theme.primary700 }} className="text-sm font-medium">
                            {t('common.projects')}
                        </Text>
                        <Text style={{ color: theme.primary600 }} className="text-2xl font-bold mt-1">
                            --
                        </Text>
                    </View>
                    <View className="flex-1 min-w-[140px] p-4 rounded-xl bg-green-50">
                        <Text className="text-green-700 text-sm font-medium">
                            {t('tasks.pending_tasks')}
                        </Text>
                        <Text className="text-green-600 text-2xl font-bold mt-1">
                            --
                        </Text>
                    </View>
                </View>

                {/* Projects List Placeholder */}
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        {t('projects.your_projects')}
                    </Text>
                    <View className="items-center py-8">
                        <Text className="text-gray-400 text-center">
                            {t('common.widgets_coming_soon')}
                        </Text>
                    </View>
                </View>

                {/* User Info Card */}
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <Text className="text-lg font-semibold text-gray-800 mb-3">
                        {t('settings.your_account')}
                    </Text>
                    <View className="flex-row items-center mb-4">
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: theme.primary100 }}
                        >
                            <Text style={{ color: theme.primary600 }} className="text-lg font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-gray-800 font-medium">{user?.name}</Text>
                            <Text className="text-gray-500 text-sm">{user?.email}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        className="py-3 rounded-lg items-center border border-red-200 bg-red-50"
                        onPress={logout}
                    >
                        <Text className="text-red-600 font-medium">{t('auth.logout')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
