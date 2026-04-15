import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useChat } from '../useChat';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useTranslate } from '../../../shared/hooks/useTranslate';
import { ChatIcon, ChevronRightIcon } from '../../../shared/icons';
import { WidgetCard } from '../../../shared/components/WidgetCard';
import { AppImage } from '../../../shared/components/media/AppImage';

export function ChatWidget({ projectId, onPress }: { projectId: number, onPress?: () => void }) {
    const { t } = useTranslate();
    const { isDark } = useSettingsStore();
    const { messages, loading } = useChat(projectId);

    const lastMessage = messages[0]; // messages is inverted, so [0] is the newest

    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';

    return (
        <WidgetCard
            title={t('chat.title', 'Chat del Proyecto')}
            icon={<ChatIcon size={20} color={isDark ? '#818cf8' : '#6366f1'} />}
            onPress={onPress}
        >
            <View className="mt-2">
                {loading ? (
                    <View className="py-4 items-center">
                        <Text className={textSecondary}>{t('common.loading', 'Cargando...')}</Text>
                    </View>
                ) : lastMessage ? (
                    <TouchableOpacity 
                        onPress={onPress}
                        className="flex-row items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                    >
                        <View className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <AppImage 
                                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(lastMessage.user.name)}&background=random` }} 
                                className="w-full h-full"
                            />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row justify-between items-center">
                                <Text className={`text-xs font-bold ${textColor}`} numberOfLines={1}>
                                    {lastMessage.user.name}
                                </Text>
                                <Text className={`text-[10px] ${textSecondary}`}>
                                    {new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <Text className={`text-xs ${textSecondary} mt-0.5`} numberOfLines={1}>
                                {lastMessage.content}
                            </Text>
                        </View>
                        <ChevronRightIcon size={16} color={isDark ? '#4b5563' : '#9ca3af'} />
                    </TouchableOpacity>
                ) : (
                    <View className="py-4 items-center">
                        <Text className={textSecondary}>{t('chat.no_messages', 'No hay mensajes recientes')}</Text>
                    </View>
                )}
                
                <TouchableOpacity 
                    onPress={onPress}
                    className="mt-3 flex-row items-center justify-center py-2 border-t border-gray-100 dark:border-gray-800"
                >
                    <Text className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {t('chat.open_chat', 'Abrir chat completo')}
                    </Text>
                </TouchableOpacity>
            </View>
        </WidgetCard>
    );
}
