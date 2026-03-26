import React from "react";
import { Pressable } from "react-native";
import { useSettingsStore } from "../../stores/settingsStore";
import { useAppTheme } from "../hooks";
import { SunIcon, MoonIcon } from "../icons";

interface ThemeToggleProps {
    className?: string; 
    size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 20 }) => {
    const { toggleDarkMode } = useSettingsStore();
    const { theme, isDark } = useAppTheme();

    const iconColor = isDark ? theme.primary400 : theme.primary600;

    return (
        <Pressable
            onPress={toggleDarkMode}
            className={`p-2 rounded-xl bg-secondary-100 dark:bg-secondary-800 active:opacity-70 active:scale-95 ${className}`}
            accessibilityLabel="Toggle Dark Mode"
        >
            {isDark ? (
                <SunIcon size={size} color={iconColor} />
            ) : (
                <MoonIcon size={size} color={iconColor} />
            )}
        </Pressable>
    );
};
