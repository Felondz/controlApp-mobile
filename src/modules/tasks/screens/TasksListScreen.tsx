import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, useWindowDimensions, Pressable } from 'react-native';
import { FlashList } from "@shopify/flash-list";
// import { FlashList } from '@shopify/flash-list';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useTasks, Task } from '../useTasks';
import { 
    ClipboardDocumentListIcon as TaskIcon, 
    PlusIcon, 
    SearchIcon, 
    FunnelIcon, 
    ExclamationTriangleIcon, 
    PencilIcon, 
    TrashIcon,
    XIcon,
    ChevronRightIcon,
    ClockIcon,
    UserCircleIcon
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import DangerButton from '../../../shared/components/DangerButton';
import Modal from '../../../shared/components/Modal';
import { SkeletonList } from '../../../shared/components/Skeleton';
import { AppImage } from '../../../shared/components/media/AppImage';
interface TasksListScreenProps {
    proyectoId: string;
    onAdd?: () => void;
    onEdit?: (task: Task) => void;
}

const getStatusBadgeStyle = (status: string, isDark: boolean) => {
    switch (status) {
        case 'todo':
            return isDark ? 'bg-orange-600' : 'bg-orange-500';
        case 'in_progress':
            return isDark ? 'bg-sky-600' : 'bg-sky-500';
        case 'done':
            return isDark ? 'bg-emerald-600' : 'bg-emerald-500';
        default:
            return isDark ? 'bg-gray-600' : 'bg-gray-500';
    }
};

const getPriorityBadgeStyle = (priority: string, isDark: boolean) => {
    switch (priority) {
        case 'high':
            return isDark ? 'bg-rose-600' : 'bg-rose-500';
        case 'medium':
            return isDark ? 'bg-amber-600' : 'bg-amber-500';
        case 'low':
            return isDark ? 'bg-indigo-600' : 'bg-indigo-500';
        default:
            return isDark ? 'bg-gray-600' : 'bg-gray-500';
    }
};

export default function TasksListScreen({ proyectoId, onAdd, onEdit }: TasksListScreenProps) {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');
    const [deleteModalTask, setDeleteModalTask] = useState<Task | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const isTablet = width >= 768;

    const { tasks, loading, refetch } = useTasks(proyectoId);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const filteredTasks = useMemo(() => {
        let result = tasks;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query)
            );
        }

        if (selectedStatus) {
            result = result.filter(task => task.status === selectedStatus);
        }

        if (selectedPriority) {
            result = result.filter(task => task.priority === selectedPriority);
        }

        return result;
    }, [tasks, searchQuery, selectedStatus, selectedPriority]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleAdd = () => {
        if (onAdd) onAdd();
        else router.push('/(app)/tasks/new');
    };

    const handleEdit = (task: Task) => {
        if (onEdit) onEdit(task);
        else router.push(`/(app)/tasks/${task.id}`);
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            todo: t('tasks.status.todo', 'Por hacer'),
            in_progress: t('tasks.status.in_progress', 'En Progreso'),
            done: t('tasks.status.done', 'Completada'),
        };
        return labels[status] || status;
    };

    const getPriorityLabel = (priority: string) => {
        const labels: Record<string, string> = {
            low: t('tasks.priority.low', 'Baja'),
            medium: t('tasks.priority.medium', 'Media'),
            high: t('tasks.priority.high', 'Alta'),
        };
        return labels[priority] || priority;
    };

    const isOverdue = (dueDate?: string) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const renderItem = ({ item }: { item: Task }) => {
        const overdue = isOverdue(item.due_date) && item.status !== 'done';
        
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleEdit(item)}
                onLongPress={() => setDeleteModalTask(item)}
                className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl px-4 py-3.5 mb-3 mx-4 shadow-sm flex-row items-center justify-between"
            >
                <View className="flex-1 pr-3">
                    <Text className="text-secondary-900 dark:text-secondary-50 font-bold text-base mb-1.5 leading-tight" numberOfLines={1}>
                        {item.title}
                    </Text>
                    {item.description ? (
                        <Text className="text-secondary-500 dark:text-secondary-400 text-sm mb-2.5" numberOfLines={1}>
                            {item.description}
                        </Text>
                    ) : null}
                    
                    <View className="flex-row items-center gap-3">
                        {item.due_date && (
                            <View className="flex-row items-center bg-secondary-50 dark:bg-secondary-800/50 px-2 py-1 rounded-md">
                                <ClockIcon size={12} color={overdue ? '#ef4444' : isDark ? '#9ca3af' : '#6b7280'} />
                                <Text className={`text-xs font-semibold ml-1 ${overdue ? 'text-red-600 dark:text-red-500 font-bold' : 'text-secondary-600 dark:text-secondary-400'}`}>
                                    {new Date(item.due_date).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                        {item.assignee && (
                            <View className="flex-row items-center bg-secondary-50 dark:bg-secondary-800/50 px-2 py-1 rounded-md">
                                <UserCircleIcon size={12} color={isDark ? '#9ca3af' : '#6b7280'} />
                                <Text className="text-xs font-semibold ml-1 text-secondary-600 dark:text-secondary-400">
                                    {item.assignee.name}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="items-end gap-2 flex-shrink-0">
                    <View className={`${getStatusBadgeStyle(item.status, isDark)} px-2.5 py-1 rounded-lg shadow-sm`}>
                        <Text className="text-xs font-bold text-white" numberOfLines={1}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                    <View className={`${getPriorityBadgeStyle(item.priority, isDark)} px-2.5 py-1 rounded-lg shadow-sm`}>
                        <Text className="text-xs font-bold text-white" numberOfLines={1}>
                            {getPriorityLabel(item.priority)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <Stack.Screen 
                options={{
                    title: t('tasks.title', 'Tareas'),
                    headerLargeTitle: true,
                    headerSearchBarOptions: {
                        placeholder: t('tasks.search_placeholder', 'Buscar tareas...'),
                        onChangeText: (e) => setSearchQuery(e.nativeEvent.text),
                        hideWhenScrolling: false,
                    },
                }}
            />

            <View className="bg-white dark:bg-secondary-950 border-b border-secondary-200 dark:border-secondary-900 pb-3 shadow-sm z-10">
                <View className="px-4 py-2">
                    <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 mb-2">
                        {t('tasks.filter_status', 'Estado')}
                    </Text>
                    <FlashList 
                        data={['', 'todo', 'in_progress', 'done']}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        // @ts-ignore
                        estimatedItemSize={100}
                        keyExtractor={(item) => item}
                        renderItem={({ item: status }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedStatus(status)}
                                className={`mr-2.5 px-4 py-2 rounded-xl border ${
                                    selectedStatus === status
                                        ? 'bg-primary-600 border-primary-600'
                                        : 'bg-secondary-50 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800'
                                }`}
                            >
                                <Text numberOfLines={1} className={`text-sm font-bold ${
                                    selectedStatus === status ? 'text-white' : 'text-secondary-600 dark:text-secondary-400'
                                }`}>
                                    {status === '' 
                                        ? t('common.all', 'Todos')
                                        : getStatusLabel(status)
                                    }
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                
                <View className="px-4 mt-2">
                    <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 mb-2">
                        {t('tasks.filter_priority', 'Severidad')}
                    </Text>
                    <FlashList 
                        data={['', 'high', 'medium', 'low']}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        // @ts-ignore
                        estimatedItemSize={100}
                        keyExtractor={(item) => item}
                        renderItem={({ item: priority }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedPriority(priority)}
                                className={`mr-2.5 px-4 py-2 rounded-xl border ${
                                    selectedPriority === priority
                                        ? 'bg-secondary-800 dark:bg-secondary-200 border-secondary-800 dark:border-secondary-200'
                                        : 'bg-secondary-50 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800'
                                }`}
                            >
                                <Text numberOfLines={1} className={`text-sm font-bold ${
                                    selectedPriority === priority ? 'text-white dark:text-secondary-900' : 'text-secondary-600 dark:text-secondary-400'
                                }`}>
                                    {priority === '' 
                                        ? t('common.all', 'Todas')
                                        : getPriorityLabel(priority)
                                    }
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>

            <View className="flex-1 pt-3">
                {loading && !refreshing ? (
                    <View className="p-5">
                        <SkeletonList count={5} />
                    </View>
                ) : filteredTasks.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 px-8">
                        <View className="w-20 h-20 rounded-2xl bg-secondary-100 dark:bg-secondary-900 items-center justify-center mb-6">
                            <TaskIcon size={40} color={isDark ? '#4b5563' : '#9ca3af'} />
                        </View>
                        <Text className="text-xl font-black text-secondary-900 dark:text-secondary-50 mb-2 text-center">
                            {tasks.length === 0 
                                ? t('tasks.empty', 'Sin Tareas')
                                : t('tasks.no_results', 'Sin resultados')
                            }
                        </Text>
                        <Text className="text-base font-bold text-secondary-500 dark:text-secondary-400 text-center mb-8 leading-relaxed">
                            {tasks.length === 0
                                ? t('tasks.empty_description', 'Agrega tu primera tarea para comenzar a organizar tu trabajo.')
                                : t('tasks.try_adjusting_filters', 'Intenta ajustar los filtros para encontrar lo que buscas.')
                            }
                        </Text>
                        {tasks.length === 0 && (
                            <PrimaryButton 
                                onPress={handleAdd}
                                className="px-8"
                            >
                                <PlusIcon size={20} color="white" />
                                <Text className="text-white font-bold ml-2">
                                    {t('tasks.new_task', 'Nueva Tarea')}
                                </Text>
                            </PrimaryButton>
                        )}
                    </View>
                ) : (
                    <FlashList
                        data={filteredTasks}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        // @ts-ignore
                            estimatedItemSize={80}
                        contentInsetAdjustmentBehavior="automatic"
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={onRefresh}
                                tintColor={theme.primary600}
                                colors={[theme.primary600]}
                            />
                        }
                    />
                )}
            </View>

            {filteredTasks.length > 0 && (
                <Pressable
                    onPress={handleAdd}
                    className="absolute bottom-10 right-8 w-16 h-16 rounded-full shadow-2xl items-center justify-center z-50 active:scale-90 transition-all"
                    style={{ 
                        backgroundColor: theme.primary600,
                        shadowColor: theme.primary600,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 10
                    }}
                >
                    <PlusIcon size={32} color="white" />
                </Pressable>
            )}

            <Modal
                visible={!!deleteModalTask}
                onClose={() => setDeleteModalTask(null)}
                size="sm"
            >
                <View className="p-6 bg-white dark:bg-secondary-900 rounded-2xl">
                    <View className="w-14 h-14 rounded-2xl bg-danger-50 dark:bg-danger-900/10 items-center justify-center mb-5 self-center">
                        <TrashIcon size={28} color="#ef4444" />
                    </View>
                    <Text className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-2 tracking-tight text-center">
                        {t('tasks.delete_task', '¿Eliminar tarea?')}
                    </Text>
                    <Text className="text-base font-medium text-secondary-500 dark:text-secondary-400 mb-8 leading-relaxed text-center">
                        {t('tasks.confirm_delete', 'Esta acción no se puede deshacer. La tarea "{title}" será eliminada permanentemente.').replace('{title}', deleteModalTask?.title || '')}
                    </Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <SecondaryButton 
                                onPress={() => setDeleteModalTask(null)}
                                className="rounded-xl"
                            >
                                <Text className="font-bold">{t('common.cancel', 'No, volver')}</Text>
                            </SecondaryButton>
                        </View>
                        <View className="flex-1">
                            <DangerButton 
                                onPress={() => {
                                    // Implementation for delete would go here
                                    setDeleteModalTask(null);
                                }}
                                className="rounded-xl"
                            >
                                <Text className="text-white font-bold">{t('common.delete', 'Sí, borrar')}</Text>
                            </DangerButton>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
