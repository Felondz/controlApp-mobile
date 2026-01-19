import { Tabs } from "expo-router";
import { View, useWindowDimensions } from "react-native";
import { getTheme } from "../../src/shared/themes";
import { useTranslate } from "../../src/shared/hooks";

export default function AppLayout() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const theme = getTheme("purple-modern");
    const { t } = useTranslate();

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: "white",
                },
                headerTitleStyle: {
                    color: theme.primary600,
                    fontWeight: "600",
                },
                tabBarActiveTintColor: theme.primary600,
                tabBarInactiveTintColor: "#6b7280",
                tabBarStyle: {
                    display: isTablet ? "none" : "flex",
                    backgroundColor: "white",
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "500",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('navigation.dashboard'),
                    tabBarIcon: ({ color, size }) => (
                        <View
                            style={{
                                width: size,
                                height: size,
                                backgroundColor: color,
                                borderRadius: 4,
                                opacity: 0.8,
                            }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="projects"
                options={{
                    title: t('navigation.projects'),
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <View
                            style={{
                                width: size,
                                height: size,
                                backgroundColor: color,
                                borderRadius: size / 2,
                                opacity: 0.8,
                            }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: t('navigation.settings'),
                    tabBarIcon: ({ color, size }) => (
                        <View
                            style={{
                                width: size,
                                height: size,
                                backgroundColor: color,
                                borderRadius: size / 4,
                                opacity: 0.8,
                            }}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
