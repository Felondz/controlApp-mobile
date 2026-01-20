import React from "react";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSettingsStore } from "../../stores/settingsStore";
import { getTheme } from "../themes";

interface ThemeToggleProps {
    className?: string; // For NativeWind classes
    size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 24 }) => {
    const { isDark, toggleDarkMode, theme } = useSettingsStore();
    const themeColors = getTheme(theme);

    // Determine icon color based on current mode
    // In dark mode: primary-400 (lighter primary)
    // In light mode: primary-600 (darker primary)
    // We'll use hardcoded colors that match standard NativeWind/Tailwind palette for simplicity, 
    // or use themeColors if mapped correctly. 
    // Let's use neutral colors for the toggle or follow the primary theme.

    // Web implementation uses: text-primary-600 dark:text-primary-400
    const iconColor = isDark ? themeColors.primary400 : themeColors.primary600;

    return (
        <TouchableOpacity
            onPress={toggleDarkMode}
            className={`p-2 rounded-full active:bg-gray-200 dark:active:bg-gray-700 ${className}`}
            accessibilityLabel="Toggle Dark Mode"
        >
            {isDark ? (
                <Feather name="sun" size={size} color={iconColor} />
            ) : (
                <Feather name="moon" size={size} color={iconColor} />
            )}
        </TouchableOpacity>
    );
};
