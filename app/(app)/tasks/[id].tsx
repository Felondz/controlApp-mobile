import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { 
    PlusIcon as PhotoIcon, 
    XIcon as XMarkIcon, 
    ChatBubbleLeftRightIcon, 
    InformationCircleIcon,
    CalendarIcon,
    FlagIcon,
    UserGroupIcon,
    LinkIcon
} from '../../../src/shared/icons';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import { useProjectStore } from '../../../src/stores/projectStore';
import { tasksApi, projectsApi } from '../../../src/services/api';
import apolloClient from '../../../src/services/graphql/client';
import { AppImage } from '../../../src/shared/components/media/AppImage';
import Input from '../../../src/shared/components/Input';
import Select from '../../../src/shared/components/inputs/Select';
import DatePicker from '../../../src/shared/components/inputs/DatePicker';
import PrimaryButton from '../../../src/shared/components/PrimaryButton';
import { useTask, useUpdateTask } from '../../../src/modules/tasks/useTasks';
import TaskComments from '../../../src/modules/tasks/components/TaskComments';

interface Member {
    id: string;
    name: string;
}

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    
    const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const { task, loading: loadingTask, refetch: refetchTask } = useTask(id as string);
    const [updateTaskMutation] = useUpdateTask();

    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        due_date: '',
        assignee_id: null as string | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                due_date: task.due_date || '',
                assignee_id: task.assignee?.id || null,
            });
        }
    }, [task]);

    useEffect(() => {
        if (activeProject?.uuid) {
            projectsApi.getOne(activeProject.uuid)
                .then(res => {
                    const proj = res.data.data || res.data;
                    const projMembers: Member[] = [];
                    if (proj.owner) projMembers.push({ id: proj.owner.id.toString(), name: proj.owner.name });
                    if (proj.users && Array.isArray(proj.users)) {
                        projMembers.push(...proj.users.map((u: any) => ({ id: u.id.toString(), name: u.name })));
                    }
                    const uniqueMembers = Array.from(new Map(projMembers.map(item => [item.id, item])).values());
                    setMembers(uniqueMembers);
                })
                .catch(err => console.error("Error loading members:", err))
                .finally(() => setLoadingMembers(false));
        }
    }, [activeProject]);

    const statusOptions = [
        { label: t('tasks.status.todo', 'Por hacer'), value: 'todo' },
        { label: t('tasks.status.in_progress', 'En Progreso'), value: 'in_progress' },
        { label: t('tasks.status.done', 'Completada'), value: 'done' }
    ];

    const priorityOptions = [
        { label: t('tasks.priority.low', 'Baja'), value: 'low' },
        { label: t('tasks.priority.medium', 'Media'), value: 'medium' },
        { label: t('tasks.priority.high', 'Alta'), value: 'high' }
    ];

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            setErrors({ title: t('validation.required', 'Este campo es obligatorio') });
            return;
        }

        if (!activeProject || !task) return;

        setLoading(true);
        
        try {
            // Using GraphQL for regular updates if no image, REST if there's an image
            if (imageUri) {
                const formData = new FormData();
                formData.append('title', form.title.trim());
                formData.append('status', form.status);
                formData.append('priority', form.priority);
                if (form.description.trim()) formData.append('description', form.description.trim());
                if (form.due_date) formData.append('due_date', form.due_date);
                if (form.assignee_id) formData.append('assignee_id', form.assignee_id);
                
                const filename = imageUri.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                formData.append('image', { uri: imageUri, name: filename, type } as any);
                
                await tasksApi.update(activeProject.uuid, task.uuid, formData);
            } else {
                await updateTaskMutation({
                    variables: {
                        id: task.id,
                        title: form.title.trim(),
                        description: form.description.trim(),
                        status: form.status,
                        priority: form.priority,
                        due_date: form.due_date,
                        assignee_id: form.assignee_id
                    }
                });
            }
            
            await apolloClient.refetchQueries({ include: "active" });
            refetchTask();
            
            Alert.alert(t('common.success', 'Éxito'), t('tasks.update_success', 'Tarea actualizada exitosamente'));
            setImageUri(null);
        } catch (error: any) {
            console.error("Task Update Error:", error);
            Alert.alert(t('common.error', 'Error'), t('tasks.update_error', 'Error al actualizar la tarea'));
        } finally {
            setLoading(false);
        }
    };

    if (loadingTask) {
        return (
            <View className="flex-1 bg-secondary-50 dark:bg-secondary-950 items-center justify-center">
                <ActivityIndicator size="large" color={theme.primary600} />
            </View>
        );
    }

    if (!task) {
        return (
            <View className="flex-1 bg-secondary-50 dark:bg-secondary-950 items-center justify-center p-6">
                <Text className="text-secondary-600 dark:text-secondary-400 text-lg text-center">{t('tasks.not_found', 'No se encontró la tarea')}</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-secondary-50 dark:bg-secondary-950"
        >
            <Stack.Screen options={{ title: task.title, presentation: 'card' }} />
            
            <View className="flex-row bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 px-4 pt-2">
                <TouchableOpacity 
                    onPress={() => setActiveTab('details')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'details' ? 'border-primary-600' : 'border-transparent'}`}
                >
                    <View className="flex-row items-center gap-2">
                        <InformationCircleIcon size={18} color={activeTab === 'details' ? theme.primary600 : '#6b7280'} />
                        <Text className={`font-bold ${activeTab === 'details' ? 'text-secondary-900 dark:text-white' : 'text-secondary-500'}`}>{t('common.details', 'Detalles')}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setActiveTab('activity')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'activity' ? 'border-primary-600' : 'border-transparent'}`}
                >
                    <View className="flex-row items-center gap-2">
                        <ChatBubbleLeftRightIcon size={18} color={activeTab === 'activity' ? theme.primary600 : '#6b7280'} />
                        <Text className={`font-bold ${activeTab === 'activity' ? 'text-secondary-900 dark:text-white' : 'text-secondary-500'}`}>{t('common.activity', 'Actividad')}</Text>
                        {task.comments && task.comments.length > 0 && (
                            <View className="bg-primary-100 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-full">
                                <Text className="text-[10px] font-bold text-primary-600">{task.comments.length}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            >
                {activeTab === 'details' ? (
                    <View className="gap-6">
                        <Input
                            label={t('tasks.form.title', 'Título')}
                            value={form.title}
                            onChangeText={(val) => { setForm({...form, title: val}); if (errors.title) setErrors({...errors, title: ''}); }}
                            error={errors.title}
                            required
                        />

                        <View>
                            <Text className="text-secondary-700 dark:text-secondary-300 font-bold mb-3 text-sm uppercase tracking-wider">{t('tasks.form.image', 'Imágenes')}</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {task.images?.map((img) => (
                                    <View key={img.id} className="w-[31%] h-24 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-800">
                                        <AppImage source={{ uri: img.image_url }} className="w-full h-full" />
                                    </View>
                                ))}
                                {imageUri && (
                                    <View className="w-[31%] h-24 rounded-xl overflow-hidden border-2 border-primary-500">
                                        <ExpoImage source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
                                        <TouchableOpacity onPress={() => setImageUri(null)} className="absolute top-1 right-1 bg-black/50 rounded-full p-1"><XMarkIcon size={12} color="white" /></TouchableOpacity>
                                    </View>
                                )}
                                <TouchableOpacity 
                                    onPress={pickImage}
                                    className="w-[31%] h-24 rounded-xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 items-center justify-center bg-secondary-50 dark:bg-secondary-900/50"
                                >
                                    <PhotoIcon size={24} color={theme.primary600} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Input
                            label={t('tasks.form.description', 'Descripción')}
                            value={form.description}
                            onChangeText={(val) => setForm({...form, description: val})}
                            multiline
                            numberOfLines={4}
                            style={{ height: 100 }}
                        />

                        <View>
                            <View className="flex-row items-center gap-2 mb-3">
                                <UserGroupIcon size={16} color={theme.primary600} />
                                <Text className="text-secondary-700 dark:text-secondary-300 font-bold text-sm uppercase tracking-wider">{t('tasks.form.assignees', 'Asignados')}</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
                                {members.map(member => {
                                    const isSelected = form.assignee_id === member.id;
                                    return (
                                        <TouchableOpacity
                                            key={member.id}
                                            onPress={() => setForm({ ...form, assignee_id: isSelected ? null : member.id })}
                                            className={`mr-3 px-4 py-2 rounded-2xl border-2 flex-row items-center ${isSelected ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20' : 'bg-white border-secondary-100 dark:bg-secondary-900 dark:border-secondary-800'}`}
                                        >
                                            <Text className={`font-bold ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-600 dark:text-secondary-400'}`}>{member.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Select label={t('tasks.form.status', 'Estado')} options={statusOptions} value={form.status} onValueChange={(val) => setForm({...form, status: val})} />
                            </View>
                            <View className="flex-1">
                                <Select label={t('tasks.form.priority', 'Prioridad')} options={priorityOptions} value={form.priority} onValueChange={(val) => setForm({...form, priority: val})} />
                            </View>
                        </View>

                        <DatePicker label={t('tasks.form.due_date', 'Vencimiento')} value={form.due_date} onChange={(date) => setForm({...form, due_date: date})} />

                        {task.related_type && (
                            <View className="bg-secondary-100 dark:bg-secondary-900 p-4 rounded-2xl flex-row items-center gap-3">
                                <LinkIcon size={20} color={theme.primary600} />
                                <View>
                                    <Text className="text-[10px] font-black uppercase text-secondary-400 tracking-widest">{t('tasks.related_resource', 'Recurso Relacionado')}</Text>
                                    <Text className="font-bold text-secondary-900 dark:text-white">{task.related_type.split('\\').pop()}: {task.related_id}</Text>
                                </View>
                            </View>
                        )}

                        <PrimaryButton onPress={handleSubmit} loading={loading} className="mt-4 py-4 rounded-2xl shadow-lg">
                            <Text className="text-white font-black text-lg">{t('common.save_changes', 'Guardar Cambios')}</Text>
                        </PrimaryButton>
                    </View>
                ) : (
                    <TaskComments taskId={task.id} comments={task.comments || []} onCommentAdded={() => refetchTask()} />
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
