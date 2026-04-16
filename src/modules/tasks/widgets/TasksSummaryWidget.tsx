import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WidgetCard } from '../../../shared/components/WidgetCard';
import { useTranslate } from '../../../shared/hooks';
import { tasksApi } from '../../../services/api';

export const TasksSummaryWidget = ({ project, ...props }: any) => {
    const { t } = useTranslate();
    const [stats, setStats] = useState<{ pending: number; completed: number; in_progress: number; overdue: number } | null>(null);
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
                    const pending = tasks.filter((t: any) => t.status === 'pending').length;
                    const in_progress = tasks.filter((t: any) => t.status === 'in_progress').length;
                    const completed = tasks.filter((t: any) => t.status === 'completed').length;
                    
                    const now = new Date();
                    const overdue = tasks.filter((t: any) => 
                        t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
                    ).length;

                    setStats({ pending, completed, in_progress, overdue });
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
        <WidgetCard className="mt-0" title={t('tasks.summary', 'Resumen de Tareas')} {...props}>
            {loading ? (
                <View className="h-24 justify-center items-center">
                    <ActivityIndicator size="small" color="#9CA3AF" />
                </View>
            ) : (
                <View>
                    {/* Stats Grid */}
                    <View className="flex-row gap-2.5 mb-4">
                        {/* Pending */}
                        <View className="flex-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 p-2.5 rounded-xl items-center">
                            <Text className="text-lg font-black text-amber-600 dark:text-amber-500">{stats?.pending || 0}</Text>
                            <Text className="text-[9px] text-amber-700 dark:text-amber-400 font-bold">{t('tasks.pending', 'Pendientes')}</Text>
                        </View>
                        {/* In Progress */}
                        <View className="flex-1 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 p-2.5 rounded-xl items-center">
                            <Text className="text-lg font-black text-sky-600 dark:text-sky-500">{stats?.in_progress || 0}</Text>
                            <Text className="text-[9px] text-sky-700 dark:text-sky-400 font-bold">{t('tasks.in_progress', 'En Proceso')}</Text>
                        </View>
                        {/* Done */}
                        <View className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 p-2.5 rounded-xl items-center">
                            <Text className="text-lg font-black text-green-600 dark:text-green-500">{stats?.completed || 0}</Text>
                            <Text className="text-[9px] text-green-700 dark:text-green-400 font-bold">{t('tasks.done', 'Listas')}</Text>
                        </View>
                    </View>

                    {/* Overdue Alert */}
                    {(stats?.overdue || 0) > 0 && (
                        <View className="bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-xl flex-row items-center gap-2.5 border border-red-100 dark:border-red-900/30">
                            <View className="w-2 h-2 bg-red-500 rounded-full" />
                            <Text className="text-xs text-red-700 dark:text-red-400 font-bold">
                                {stats?.overdue} {t('tasks.overdue_count', 'tareas vencidas')}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </WidgetCard>
    );
};
