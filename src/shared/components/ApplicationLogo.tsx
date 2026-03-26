import React from "react";
import { View, Text } from "react-native";
import { useTranslate, useAppTheme } from "../hooks";
import { AppIcon } from "../icons";

interface ApplicationLogoProps {
    size?: number;
    color?: string;
    showText?: boolean;
    style?: any;
}

export const ApplicationLogo: React.FC<ApplicationLogoProps> = ({
    size = 32,
    color,
    showText = true,
    style,
}) => {
    const { theme, isDark } = useAppTheme();
    const { t } = useTranslate();
    
    // Icon color follows the main theme
    const iconColor = color || theme.primary600;
    
    // Gradient effect colors from theme
    const controlColor = theme.primary400; // Lighter
    const appColor = theme.primary700;     // Darker

    return (
        <View className="flex-row items-center gap-3" style={style}>
            {/* Logo Icon without frame */}
            <View className="items-center justify-center">
                <AppIcon size={size} color={iconColor} />
            </View>

            {showText && (
                <View className="flex-row items-center">
                    <Text
                        className="text-2xl font-black tracking-tighter"
                        style={{ color: controlColor }}
                    >
                        Control
                    </Text>
                    <Text
                        className="text-2xl font-black tracking-tighter"
                        style={{ color: appColor }}
                    >
                        App
                    </Text>
                </View>
            )}
        </View>
    );
};
