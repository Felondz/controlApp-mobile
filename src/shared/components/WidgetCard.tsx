import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useAppTheme } from '../hooks';

interface WidgetCardProps {
    title?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    onHide?: () => void;
    onSettings?: () => void;
    onPress?: () => void;
    dragHandleProps?: any; // From react-native-draggable-flatlist
    className?: string;
}

export const WidgetCard = ({
    title,
    icon,
    children,
    onHide,
    onSettings,
    onPress,
    dragHandleProps, 
    className = ''
}: WidgetCardProps) => {
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const content = (
        <View className={`bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 mb-6 overflow-hidden ${className}`}>
            {/* Header - Only render if title is present */}
            {title && (
                <View
                    className="flex-row items-center justify-between px-5 py-3 border-b border-secondary-100 dark:border-secondary-700"
                    style={{ borderLeftWidth: 3, borderLeftColor: theme.primary500 }}
                >
                    <View className="flex-row items-center gap-2">
                        {/* Drag Handle */}
                        {dragHandleProps && (
                            <Pressable
                                onLongPress={dragHandleProps.onLongPress}
                                delayLongPress={200}
                                className="p-1.5 -ml-1.5 rounded-lg bg-secondary-50 dark:bg-secondary-700/50 active:bg-secondary-100"
                            >
                                <Text className="text-secondary-400 dark:text-secondary-500 font-bold">⋮⋮</Text>
                            </Pressable>
                        )}

                        {icon && <View>{icon}</View>}

                        <Text 
                            className="font-bold text-base tracking-tight"
                            style={{ color: isDark ? theme.primary400 : theme.primary700 }}
                        >
                            {title}
                        </Text>
                    </View>

                    {/* Actions */}
                    <View className="flex-row items-center gap-1">
                        {onSettings && (
                            <Pressable onPress={onSettings} className="p-2 rounded-lg active:bg-secondary-100 dark:active:bg-secondary-700">
                                <Text className="text-secondary-400 dark:text-secondary-500 text-lg">⚙️</Text>
                            </Pressable>
                        )}
                        {onHide && (
                            <Pressable onPress={onHide} className="p-2 rounded-lg active:bg-secondary-100 dark:active:bg-secondary-700">
                                <Text className="text-secondary-400 dark:text-secondary-500 text-lg">✕</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            )}

            {/* Content Body */}
            <View className={`p-5 ${isTablet ? 'px-6' : ''}`}>
                {children}
            </View>
        </View>
    );

    if (onPress) {
        return (
            <Pressable onPress={onPress}>
                {content}
            </Pressable>
        );
    }

    return content;
};
