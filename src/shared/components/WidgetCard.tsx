import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useAppTheme } from '../hooks';

interface WidgetCardProps {
    title?: string;
    children: React.ReactNode;
    onHide?: () => void;
    onSettings?: () => void;
    dragHandleProps?: any; // From react-native-draggable-flatlist
    className?: string;
}

export const WidgetCard = ({
    title,
    children,
    onHide,
    onSettings,
    dragHandleProps, 
    className = ''
}: WidgetCardProps) => {
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    return (
        <View className={`bg-white dark:bg-secondary-800 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-700 mb-6 overflow-hidden ${className}`}>
            {/* Header - Only render if title is present */}
            {title && (
                <View
                    className="flex-row items-center justify-between px-5 py-4 border-b border-secondary-100 dark:border-secondary-700"
                    style={{ borderLeftWidth: 4, borderLeftColor: theme.primary500 }}
                >
                    <View className="flex-row items-center gap-3">
                        {/* Drag Handle */}
                        {dragHandleProps && (
                            <Pressable
                                onLongPress={dragHandleProps.onLongPress}
                                delayLongPress={200}
                                className="p-2 -ml-2 rounded-lg bg-secondary-50 dark:bg-secondary-700/50 active:bg-secondary-100"
                            >
                                <Text className="text-secondary-400 dark:text-secondary-500 font-bold">⋮⋮</Text>
                            </Pressable>
                        )}

                        <Text 
                            className="font-black text-base uppercase tracking-tight"
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
};
