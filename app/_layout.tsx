import "../global.css";
import { StatusBar } from "expo-status-bar";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, TextInput } from "react-native";
import { ApolloProvider } from "@apollo/client/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { apolloClient } from "../src/services/graphql/client";
import { useAuthStore } from "../src/stores/authStore";
import { useSettingsStore } from "../src/stores/settingsStore";
import { useAppTheme } from "../src/shared/hooks/useAppTheme";
import { useColorScheme } from "nativewind";
import { ReanimatedLogLevel, configureReanimatedLogger } from "react-native-reanimated";

// Disable Reanimated strict mode
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

// Set global text accessibility defaults
// @ts-ignore
if (Text.defaultProps == null) Text.defaultProps = {};
// @ts-ignore
Text.defaultProps.allowFontScaling = true;
// @ts-ignore
Text.defaultProps.maxFontSizeMultiplier = 1.3;

// @ts-ignore
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
// @ts-ignore
TextInput.defaultProps.allowFontScaling = true;
// @ts-ignore
TextInput.defaultProps.maxFontSizeMultiplier = 1.3;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

function RootLayoutContent() {
    const { isAuthenticated, isLoading: authLoading, initialize: initAuth } = useAuthStore();
    const { isInitialized: settingsReady, initialize: initSettings, isDark } = useSettingsStore();
    const segments = useSegments();
    const router = useRouter();
    const { colors: themeColors } = useAppTheme();
    const { setColorScheme } = useColorScheme();
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        const prepare = async () => {
            try {
                console.log('[RootLayout] Starting initAuth...');
                await initAuth();
                console.log('[RootLayout] initAuth finished.');
                
                console.log('[RootLayout] Starting initSettings...');
                await initSettings();
                console.log('[RootLayout] initSettings finished.');
            } catch (error) {
                console.error('[RootLayout] Initialization error:', error);
            } finally {
                setIsAppReady(true);
                console.log('[RootLayout] isAppReady set to true.');
            }
        };
        prepare();
    }, []);

    useEffect(() => {
        if (settingsReady) {
            setColorScheme(isDark ? "dark" : "light");
        }
    }, [isDark, settingsReady]);

    useEffect(() => {
        console.log('[RootLayout] Auth Sync Effect:', {
            isAppReady,
            authLoading,
            settingsReady,
            isAuthenticated,
            segment: segments[0]
        });

        if (!isAppReady || authLoading || !settingsReady) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!isAuthenticated && !inAuthGroup) {
            console.log('[RootLayout] Not authenticated, redirecting to login...');
            router.replace("/(auth)/login");
        } else if (isAuthenticated && inAuthGroup) {
            console.log('[RootLayout] Authenticated, redirecting to app...');
            router.replace("/(app)");
        }
    }, [isAuthenticated, segments, authLoading, settingsReady, isAppReady]);

    if (!isAppReady || authLoading || !settingsReady) {
        return (
            <View style={{ flex: 1, backgroundColor: isDark ? '#030712' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={themeColors.primary500} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Slot />
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <ApolloProvider client={apolloClient}>
                        <RootLayoutContent />
                    </ApolloProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
