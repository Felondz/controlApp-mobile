import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/stores/authStore";
import { useSettingsStore } from "../src/stores/settingsStore";
import { getTheme } from "../src/shared/themes";

export default function RootLayout() {
    const { isAuthenticated, isLoading: authLoading, initialize: initAuth } = useAuthStore();
    const { isInitialized: settingsReady, initialize: initSettings, theme } = useSettingsStore();
    const segments = useSegments();
    const router = useRouter();
    const themeColors = getTheme(theme);

    // Initialize stores on app start
    useEffect(() => {
        initAuth();
        initSettings();
    }, []);

    // Handle auth state changes
    useEffect(() => {
        if (authLoading || !settingsReady) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!isAuthenticated && !inAuthGroup) {
            router.replace("/(auth)/login");
        } else if (isAuthenticated && inAuthGroup) {
            router.replace("/(app)");
        }
    }, [isAuthenticated, segments, authLoading, settingsReady]);

    // Show loading screen while initializing
    if (authLoading || !settingsReady) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color={themeColors.primary500} />
            </View>
        );
    }

    return <Slot />;
}
