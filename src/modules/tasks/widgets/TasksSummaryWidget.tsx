import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WidgetCard } from '../../../shared/components/WidgetCard';
import { useTranslate } from '../../../shared/hooks';
import { tasksApi } from '../../../services/api';

export const TasksSummaryWidget = ({ project, ...props }: any) => {
    const { t } = useTranslate();
    const [stats, setStats] = useState<{ pending: number; completed: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchTasks = async () => {
            if (!project?.id) return;
            try {
                // tasksApi.getAll returns data structure, we need to count or use provided stats
                const response = await tasksApi.getAll(project.id);
                // Assuming response.data is array of tasks or has metadata
                // This logic might need adjustment based on exact API response
                const tasks = Array.isArray(response.data) ? response.data : response.data.data;

                if (isMounted && tasks) {
                    const pending = tasks.filter((t: any) => t.status !== 'completed').length;
                    const completed = tasks.filter((t: any) => t.status === 'completed').length;
                    setStats({ pending, completed });
                    setLoading(false);
                }
            } catch (error) {
                console.error(`Failed to fetch tasks for project ${project.id}:`, error);
                if (isMounted) setLoading(false);
            }
        };

        fetchTasks();

        return () => { isMounted = false; };
    }, [project.id]);

    // Web parity: Grid of 3 + Overdue Alert
    return (
        <WidgetCard className="mt-0" {...props}>
            {loading ? (
                <View className="h-24 justify-center items-center">
                    <ActivityIndicator size="small" color="#9CA3AF" />
                </View>
            ) : (
                <View>
                    {/* Stats Grid */}
                    <View className="flex-row gap-2 mb-3">
                        {/* Pending */}
                        <View className="flex-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-2 rounded-lg items-center">
                            <Text className="text-xl font-bold text-amber-600 dark:text-amber-500">{stats?.pending || 0}</Text>
                            <Text className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-medium">{t('tasks.pending', 'Pending')}</Text>
                        </View>
                        {/* In Progress */}
                        <View className="flex-1 bg-sky-100 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 p-2 rounded-lg items-center">
                            <Text className="text-xl font-bold text-sky-600 dark:text-sky-500">{0}</Text>
                            <Text className="text-[10px] text-sky-700 dark:text-sky-400 uppercase font-medium">{t('tasks.in_progress', 'Progress')}</Text>
                        </View>
                        {/* Done */}
                        <View className="flex-1 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-2 rounded-lg items-center">
                            <Text className="text-xl font-bold text-green-600 dark:text-green-500">{stats?.completed || 0}</Text>
                            <Text className="text-[10px] text-green-700 dark:text-green-400 uppercase font-medium">{t('tasks.done', 'Done')}</Text>
                        </View>
                    </View>

                    {/* Overdue Alert */}
                    {(0) > 0 && ( // TODO: Add overdue count to state
                        <View className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md flex-row items-center gap-2">
                            <View className="w-2 h-2 bg-red-500 rounded-full" />
                            <Text className="text-xs text-red-700 dark:text-red-400 font-medium">
                                {t('tasks.overdue_count', 'Overdue tasks')}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </WidgetCard>
    );
};
