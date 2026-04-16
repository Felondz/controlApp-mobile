import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, useWindowDimensions, Pressable } from 'react-native';
import { FlashList } from "@shopify/flash-list";
// import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
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

interface TasksListScreenProps {
    proyectoId: number;
    onAdd?: () => void;
    onEdit?: (task: Task) => void;
}

const getStatusBadgeStyle = (status: string, isDark: boolean) => {
    switch (status) {
        case 'pending':
            return isDark ? 'bg-amber-900/30 text-amber-500' : 'bg-amber-100 text-amber-600';
        case 'in_progress':
            return isDark ? 'bg-sky-900/30 text-sky-500' : 'bg-sky-100 text-sky-600';
        case 'completed':
            return isDark ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-600';
        default:
            return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
};

const getPriorityBadgeStyle = (priority: string, isDark: boolean) => {
    switch (priority) {
        case 'high':
            return isDark ? 'bg-red-900/30 text-red-500' : 'bg-red-100 text-red-600';
        case 'medium':
            return isDark ? 'bg-amber-900/30 text-amber-500' : 'bg-amber-100 text-amber-600';
        case 'low':
            return isDark ? 'bg-blue-900/30 text-blue-500' : 'bg-blue-100 text-blue-600';
        default:
            return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
};

export default function TasksListScreen({ proyectoId, onAdd, onEdit }: TasksListScreenProps) {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModalTask, setDeleteModalTask] = useState<Task | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const isTablet = width >= 768;

    const { tasks, loading, refetch } = useTasks(proyectoId);

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

        return result;
    }, [tasks, searchQuery, selectedStatus]);

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
            pending: t('tasks.status.pending', 'Pendiente'),
            in_progress: t('tasks.status.in_progress', 'En Progreso'),
            completed: t('tasks.status.completed', 'Completada'),
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
        const overdue = isOverdue(item.due_date) && item.status !== 'completed';
        
        return (
            <View className={`p-2 ${isTablet ? 'w-1/2' : 'w-full'}`}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleEdit(item)}
                    className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm h-full"
                >
                    <View className="p-4">
                        <View className="flex-row items-start justify-between mb-3">
                            <View className="flex-1 mr-2">
                                <Text className="text-secondary-900 dark:text-secondary-50 font-bold text-base leading-tight" numberOfLines={2}>
                                    {item.title}
                                </Text>
                            </View>
                            <View className={`px-2 py-0.5 rounded-full ${getStatusBadgeStyle(item.status, isDark)}`}>
                                <Text className="text-[10px] font-bold">
                                    {getStatusLabel(item.status)}
                                </Text>
                            </View>
                        </View>

                        {item.description ? (
                            <Text className="text-secondary-500 dark:text-secondary-400 text-xs mb-4" numberOfLines={2}>
                                {item.description}
                            </Text>
                        ) : null}

                        <View className="flex-row flex-wrap gap-2 mt-auto">
                            <View className={`px-2 py-0.5 rounded-full flex-row items-center ${getPriorityBadgeStyle(item.priority, isDark)}`}>
                                <Text className="text-[9px] font-bold">
                                    {getPriorityLabel(item.priority)}
                                </Text>
                            </View>

                            {item.due_date && (
                                <View className={`px-2 py-0.5 rounded-full flex-row items-center ${overdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-secondary-100 dark:bg-secondary-800'}`}>
                                    <ClockIcon size={12} color={overdue ? '#ef4444' : isDark ? '#9ca3af' : '#6b7280'} />
                                    <Text className={`text-[9px] font-bold ml-1 ${overdue ? 'text-red-600 dark:text-red-500' : 'text-secondary-600 dark:text-secondary-400'}`}>
                                        {new Date(item.due_date).toLocaleDateString()}
                                    </Text>
                                </View>
                            )}

                            {item.assigned && (
                                <View className="px-2 py-0.5 rounded-full flex-row items-center bg-secondary-100 dark:bg-secondary-800">
                                    <UserCircleIcon size={12} color={isDark ? '#9ca3af' : '#6b7280'} />
                                    <Text className="text-[9px] font-bold ml-1 text-secondary-600 dark:text-secondary-400">
                                        {item.assigned.name}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {overdue && (
                            <View className="flex-row items-center mt-3 bg-danger-50 dark:bg-danger-900/10 px-2.5 py-1.5 rounded-xl self-start border border-danger-100 dark:border-danger-900/20">
                                <ExclamationTriangleIcon size={12} color="#ef4444" />
                                <Text className="text-[10px] font-bold text-danger-500 ml-1.5">
                                    {t('tasks.overdue', 'Vencida')}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row border-t border-secondary-100 dark:border-secondary-800/50 bg-secondary-50/30 dark:bg-secondary-800/30">
                        <TouchableOpacity 
                            onPress={() => handleEdit(item)} 
                            className="flex-row items-center justify-center flex-1 py-3 active:bg-secondary-100 dark:active:bg-secondary-800"
                        >
                            <PencilIcon size={14} color={theme.primary600} />
                            <Text className="text-xs font-bold ml-2" style={{ color: theme.primary600 }}>
                                {t('common.edit', 'Editar')}
                            </Text>
                        </TouchableOpacity>
                        <View className="w-[1px] bg-secondary-100 dark:border-secondary-800/50" />
                        <TouchableOpacity 
                            onPress={() => setDeleteModalTask(item)} 
                            className="flex-row items-center justify-center flex-1 py-3 active:bg-danger-50 dark:active:bg-danger-900/10"
                        >
                            <TrashIcon size={14} color="#ef4444" />
                            <Text className="text-xs font-bold ml-2 text-danger-500">
                                {t('common.delete', 'Eliminar')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            {/* Header / Search */}
            <View className="px-5 pt-4 pb-6 bg-white dark:bg-secondary-950 border-b border-secondary-100 dark:border-secondary-900">
                <View className="flex-row items-center justify-between mb-6 px-1">
                    <Text className="text-3xl font-black tracking-tighter text-secondary-900 dark:text-secondary-50">
                        {t('tasks.title', 'Tareas')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        className={`w-11 h-11 rounded-2xl items-center justify-center border ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-secondary-900'} ${showFilters ? 'border-primary-200 dark:border-primary-800' : 'border-secondary-200 dark:border-secondary-800'}`}
                    >
                        <FunnelIcon 
                            size={20} 
                            color={showFilters ? theme.primary600 : isDark ? '#9ca3af' : '#6b7280'} 
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center bg-secondary-100/50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl px-4 shadow-sm">
                    <SearchIcon size={20} color={isDark ? '#4b5563' : '#9ca3af'} />
                    <TextInput
                        className="flex-1 py-4 px-3 text-secondary-900 dark:text-secondary-50 font-bold"
                        placeholder={t('tasks.search_placeholder', 'Buscar tareas...')}
                        placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => setSearchQuery('')}
                            className="w-8 h-8 rounded-full bg-secondary-200 dark:bg-secondary-800 items-center justify-center"
                        >
                            <XIcon size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    )}
                </View>

                {showFilters && (
                    <View className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-3 ml-1">
                            {t('tasks.filter_by_status', 'Filtrar por estado')}
                        </Text>
                        <FlashList 
                            data={['', 'pending', 'in_progress', 'completed']}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            // @ts-ignore
                            estimatedItemSize={100}
                            keyExtractor={(item) => item}
                            renderItem={({ item: status }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedStatus(status)}
                                    className={`mr-3 px-5 py-2.5 rounded-2xl border ${
                                        selectedStatus === status
                                            ? 'bg-primary-600 border-primary-600'
                                            : 'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800'
                                    }`}
                                >
                                    <Text className={`text-xs font-black uppercase tracking-wider ${
                                        selectedStatus === status ? 'text-white' : 'text-secondary-600 dark:text-secondary-400'
                                    }`}>
                                        {status === '' 
                                            ? t('common.all', 'Todas')
                                            : getStatusLabel(status)
                                        }
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>

            <View className="flex-1">
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
                        <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 text-center mb-8 leading-relaxed">
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
                            estimatedItemSize={180}
                        numColumns={isTablet ? 2 : 1}
                        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
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
                    <Text className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-8 leading-relaxed text-center">
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
