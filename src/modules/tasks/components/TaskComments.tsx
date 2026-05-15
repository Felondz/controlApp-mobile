import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCreateTaskComment, TaskComment } from '../useTasks';
import { PaperAirplaneIcon } from '../../../shared/icons';
import { AppImage } from '../../../shared/components/media/AppImage';

interface TaskCommentsProps {
    taskId: string;
    comments: TaskComment[];
    onCommentAdded?: () => void;
}

export default function TaskComments({ taskId, comments, onCommentAdded }: TaskCommentsProps) {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const [content, setContent] = useState('');
    const [createComment, { loading }] = useCreateTaskComment();

    const handleSubmit = async () => {
        if (!content.trim() || loading) return;

        try {
            await createComment({
                variables: {
                    task_id: taskId,
                    content: content.trim(),
                },
            });
            setContent('');
            if (onCommentAdded) onCommentAdded();
        } catch (error) {
            console.error('[TaskComments] Error adding comment:', error);
        }
    };

    const renderComment = ({ item }: { item: TaskComment }) => (
        <View className="flex-row mb-6">
            <View className="w-10 h-10 rounded-full bg-secondary-200 dark:bg-secondary-800 items-center justify-center mr-3 overflow-hidden">
                {item.user.profile_photo_url ? (
                    <AppImage source={{ uri: item.user.profile_photo_url }} className="w-full h-full" />
                ) : (
                    <Text className="text-secondary-600 dark:text-secondary-400 font-bold">
                        {item.user.name.charAt(0).toUpperCase()}
                    </Text>
                )}
            </View>
            <View className="flex-1 bg-white dark:bg-secondary-900 p-3 rounded-2xl border border-secondary-100 dark:border-secondary-800 shadow-sm">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-bold text-secondary-900 dark:text-secondary-100 text-sm">
                        {item.user.name}
                    </Text>
                    <Text className="text-[10px] text-secondary-500">
                        {new Date(item.created_at).toLocaleString()}
                    </Text>
                </View>
                <Text className="text-secondary-700 dark:text-secondary-300 text-sm leading-relaxed">
                    {item.content}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1">
            <View className="flex-row items-center mb-6">
                <View className="w-1 h-4 rounded-full bg-primary-600 mr-2" style={{ backgroundColor: theme.primary600 }} />
                <Text className="text-lg font-black tracking-tight text-secondary-900 dark:text-white">
                    {t('tasks.comments', 'Comentarios')} ({comments.length})
                </Text>
            </View>

            <View className="mb-8">
                <View className="flex-row items-end gap-2 bg-white dark:bg-secondary-900 p-2 rounded-2xl border border-secondary-200 dark:border-secondary-800 shadow-sm">
                    <TextInput
                        className="flex-1 px-3 py-2 text-secondary-900 dark:text-white min-h-[40px] max-h-[120px]"
                        placeholder={t('tasks.add_comment', 'Escribe un comentario...')}
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        value={content}
                        onChangeText={setContent}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!content.trim() || loading}
                        className={`w-10 h-10 rounded-xl items-center justify-center ${
                            content.trim() && !loading ? 'bg-primary-600' : 'bg-secondary-100 dark:bg-secondary-800'
                        }`}
                        style={content.trim() && !loading ? { backgroundColor: theme.primary600 } : {}}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <PaperAirplaneIcon size={20} color={content.trim() ? "white" : (isDark ? '#4b5563' : '#9ca3af')} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {comments.length === 0 ? (
                <View className="py-10 items-center justify-center">
                    <Text className="text-secondary-500 dark:text-secondary-400 italic">
                        {t('tasks.no_comments', 'No hay comentarios aún.')}
                    </Text>
                </View>
            ) : (
                <View>
                    {comments.map((comment) => (
                        <View key={comment.id}>
                            {renderComment({ item: comment })}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
