import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '../useChat';
import { Message } from '../../../types';
import { useAuthStore } from '../../../stores/authStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useTranslate } from '../../../shared/hooks/useTranslate';
import { 
    ChevronLeftIcon, 
    PaperClipIcon, 
    FaceSmileIcon, 
    ChatIcon,
    EllipsisHorizontalIcon
} from '../../../shared/icons';
import { AppImage } from '../../../shared/components/media/AppImage';

interface MessageItemProps {
    message: Message;
    isOwn: boolean;
    isDark: boolean;
}

const MessageItem = React.memo(({ message, isOwn, isDark }: MessageItemProps) => {
    const bgColor = isOwn 
        ? (isDark ? 'bg-primary-900/40' : 'bg-primary-50')
        : (isDark ? 'bg-gray-800' : 'bg-white');
    
    const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

    return (
        <View className={`mb-4 flex-row ${isOwn ? 'justify-end' : 'justify-start'} px-4`}>
            {!isOwn && (
                <View className="w-8 h-8 rounded-xl overflow-hidden mr-2 mt-1">
                    <AppImage 
                        source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(message.user.name)}&background=random` }} 
                        className="w-full h-full"
                    />
                </View>
            )}
            <View className={`max-w-[80%] rounded-2xl p-3 ${bgColor} ${!isOwn ? 'border ' + borderColor : ''}`}>
                {!isOwn && (
                    <Text className="text-sm font-bold text-primary-600 mb-1">
                        {message.user.name}
                    </Text>
                )}
                <Text className={`text-base ${textColor}`}>
                    {message.content}
                </Text>
                <View className="flex-row items-center justify-end mt-1 gap-2">
                    {message.reactions && message.reactions.length > 0 && (
                        <View className="flex-row bg-gray-100 dark:bg-gray-900 rounded-full px-1.5 py-0.5 border border-gray-200 dark:border-gray-700">
                            {message.reactions.map((r, i) => (
                                <Text key={i} className="text-sm">{r.type} {r.count}</Text>
                            ))}
                        </View>
                    )}
                    <Text className={`text-sm ${textSecondary}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                
                {message.replies_count && message.replies_count > 0 ? (
                    <View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex-row items-center">
                        <ChatIcon size={12} color={isDark ? '#818cf8' : '#6366f1'} />
                        <Text className="text-sm text-primary-600 ml-1 font-bold">
                            {message.replies_count} hilos
                        </Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
});

export default function ChatScreen({ projectId, onBack }: { projectId: number, onBack?: () => void }) {
    const insets = useSafeAreaInsets();
    const { t } = useTranslate();
    const { isDark } = useSettingsStore();
    const { user } = useAuthStore();
    const { messages, loading, sendMessage } = useChat(projectId);
    const [inputText, setInputText] = useState('');

    const handleSend = useCallback(() => {
        if (inputText.trim()) {
            sendMessage(inputText.trim());
            setInputText('');
        }
    }, [inputText, sendMessage]);

    const renderItem = useCallback(({ item }: { item: Message }) => (
        <MessageItem 
            message={item} 
            isOwn={item.user_id === user?.id} 
            isDark={isDark}
        />
    ), [user?.id, isDark]);

    const bgColor = isDark ? 'bg-gray-950' : 'bg-gray-50';
    const headerBg = isDark ? 'bg-gray-900' : 'bg-white';
    const inputBg = isDark ? 'bg-gray-900' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

    // Offset completo: Header AppLayout (70) + Header Chat (55) + insets.top
    const verticalOffset = 125 + insets.top;

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Header Fijo */}
            <View className={`px-4 py-3 ${headerBg} border-b ${borderColor} flex-row items-center justify-between`} style={{ height: 55 }}>
                <View className="flex-row items-center">
                    {onBack && (
                        <TouchableOpacity onPress={onBack} className="mr-2">
                            <ChevronLeftIcon size={24} color={isDark ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text className={`font-bold ${textColor}`}>Chat de Proyecto</Text>
                        <Text className="text-sm text-green-500">● En línea</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <EllipsisHorizontalIcon size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={verticalOffset}
            >
                {/* Messages Area */}
                <View className="flex-1">
                    {loading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator color="#6366f1" />
                        </View>
                    ) : (
                        <FlashList
                            data={messages}
                            renderItem={renderItem}
                            estimatedItemSize={80}
                            inverted
                            contentContainerStyle={{ paddingVertical: 10 }}
                        />
                    )}
                </View>

                {/* Input Area */}
                <View 
                    className={`p-3 ${inputBg} border-t ${borderColor} flex-row items-center gap-2`}
                    style={{ paddingBottom: Math.max(insets.bottom, 12) }}
                >
                    <TouchableOpacity className="p-2 active:opacity-60">
                        <PaperClipIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>
                    
                    <View className={`flex-1 flex-row items-center rounded-2xl px-4 py-1 border ${borderColor} ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
                        <TextInput
                            className={`flex-1 py-2.5 text-base font-medium ${textColor}`}
                            placeholder={t('chat.placeholder', 'Escribe un mensaje...')}
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity className="ml-1 active:opacity-60">
                            <FaceSmileIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        className={`w-11 h-11 rounded-xl items-center justify-center ${inputText.trim() ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                        <Text className="text-white font-black">↑</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
