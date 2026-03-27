import "../global.css";
import { StatusBar } from "expo-status-bar";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { ApolloProvider } from "@apollo/client/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { apolloClient } from "../src/services/graphql/client";
import { useAuthStore } from "../src/stores/authStore";
import { useSettingsStore } from "../src/stores/settingsStore";
import { useAppTheme } from "../src/shared/hooks/useAppTheme";
import { useColorScheme } from "nativewind";
import { ReanimatedLogLevel, configureReanimatedLogger } from "react-native-reanimated";

// Disable Reanimated strict mode to avoid warnings about shared value access during render
// especially when using libraries like NativeWind v4 which rely heavily on shared values.
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

export default function RootLayout() {
    const { isAuthenticated, isLoading: authLoading, initialize: initAuth } = useAuthStore();
    const { isInitialized: settingsReady, initialize: initSettings, isDark } = useSettingsStore();
    const segments = useSegments();
    const router = useRouter();
    const { colors: themeColors } = useAppTheme();
    const { setColorScheme } = useColorScheme();
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        const prepare = async () => {
            await initAuth();
            await initSettings();
            setIsAppReady(true);
        };
        prepare();
    }, []);

    useEffect(() => {
        if (settingsReady) {
            setColorScheme(isDark ? "dark" : "light");
        }
    }, [isDark, settingsReady]);

    useEffect(() => {
        if (!isAppReady || authLoading || !settingsReady) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!isAuthenticated && !inAuthGroup) {
            router.replace("/(auth)/login");
        } else if (isAuthenticated && inAuthGroup) {
            router.replace("/(app)");
        }
    }, [isAuthenticated, segments, authLoading, settingsReady, isAppReady]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ApolloProvider client={apolloClient}>
                    <StatusBar style={isDark ? "light" : "dark"} />
                    <Slot />
                    {(!isAppReady || authLoading || !settingsReady) && (
                        <View className="absolute inset-0 bg-secondary-50 dark:bg-secondary-900 items-center justify-center z-50">
                            <ActivityIndicator size="large" color={themeColors.primary500} />
                        </View>
                    )}
                </ApolloProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

