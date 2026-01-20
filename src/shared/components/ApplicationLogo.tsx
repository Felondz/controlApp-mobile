import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { View, Text } from "react-native";
import { getTheme } from "../themes";
import { useTranslate } from "../hooks";

interface ApplicationLogoProps extends SvgProps {
    size?: number;
    color?: string;
    showText?: boolean;
}

export const ApplicationLogo: React.FC<ApplicationLogoProps> = ({
    size = 32,
    color,
    showText = true,
    style,
    ...props
}) => {
    const theme = getTheme("purple-modern");
    const { t } = useTranslate();
    const finalColor = color || theme.primary600;

    return (
        <View className="flex-row items-center gap-2" style={style}>
            <Svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={finalColor}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                {...props}
            >
                <Path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </Svg>
            {showText && (
                <Text
                    className="text-3xl font-bold"
                    style={{ color: theme.primary600 }}
                >
                    {t('app.name') || 'ControlApp'}
                </Text>
            )}
        </View>
    );
};
