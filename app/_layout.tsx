import "../global.css";
import { StatusBar } from "expo-status-bar";
import { Slot, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/stores/authStore";
import { useSettingsStore } from "../src/stores/settingsStore";
import { getTheme } from "../src/shared/themes";
import { useColorScheme } from "nativewind";

export default function RootLayout() {
    const { isAuthenticated, isLoading: authLoading, initialize: initAuth } = useAuthStore();
    const { isInitialized: settingsReady, initialize: initSettings, theme, isDark } = useSettingsStore();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();
    const themeColors = getTheme(theme);
    const { setColorScheme } = useColorScheme();

    // Initialize stores on app start
    useEffect(() => {
        initAuth();
        initSettings();
    }, []);

    // Sync Dark Mode with NativeWind
    useEffect(() => {
        if (settingsReady) {
            setColorScheme(isDark ? "dark" : "light");
        }
    }, [isDark, settingsReady]);

    // Handle auth state changes
    useEffect(() => {
        if (authLoading || !settingsReady || !navigationState?.key) return;

        const inAuthGroup = segments[0] === "(auth)";

        // Use setTimeout to push navigation to next tick, avoiding "navigate before mount" error
        const timer = setTimeout(() => {
            if (!isAuthenticated && !inAuthGroup) {
                router.replace("/(auth)/login");
            } else if (isAuthenticated && inAuthGroup) {
                router.replace("/(app)");
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [isAuthenticated, segments, authLoading, settingsReady, navigationState?.key]);

    return (
        <View className="flex-1">
            <StatusBar style={isDark ? "light" : "dark"} />
            <Slot />
            {(authLoading || !settingsReady) && (
                <View className="absolute inset-0 bg-gray-50 dark:bg-gray-900 items-center justify-center z-50">
                    <ActivityIndicator size="large" color={themeColors.primary500} />
                </View>
            )}
        </View>
    );
}
