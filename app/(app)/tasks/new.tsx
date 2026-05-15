import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { PlusIcon as PhotoIcon, XIcon as XMarkIcon, UserGroupIcon } from '../../../src/shared/icons';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import { useProjectStore } from '../../../src/stores/projectStore';
import { tasksApi, projectsApi } from '../../../src/services/api';
import apolloClient from '../../../src/services/graphql/client';
import Input from '../../../src/shared/components/Input';
import Select from '../../../src/shared/components/inputs/Select';
import DatePicker from '../../../src/shared/components/inputs/DatePicker';
import PrimaryButton from '../../../src/shared/components/PrimaryButton';

interface Member {
    id: string;
    name: string;
}

export default function CreateTaskScreen() {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        assignee_id: null as string | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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

        if (!activeProject) return;

        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('title', form.title.trim());
            formData.append('status', form.status);
            formData.append('priority', form.priority);
            if (form.description.trim()) formData.append('description', form.description.trim());
            if (form.due_date) formData.append('due_date', form.due_date);
            if (form.assignee_id) formData.append('assignee_id', form.assignee_id);
            
            if (imageUri) {
                const filename = imageUri.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                formData.append('image', { uri: imageUri, name: filename, type } as any);
            }
            
            await tasksApi.create(activeProject.uuid, formData);
            await apolloClient.refetchQueries({ include: "active" });

            Alert.alert(
                t('common.success', 'Éxito'),
                t('tasks.create_success', 'Tarea creada exitosamente'),
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error("Task Creation Error:", error);
            Alert.alert(t('common.error', 'Error'), t('tasks.create_error', 'Error al crear la tarea'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-secondary-50 dark:bg-secondary-950"
        >
            <Stack.Screen 
                options={{
                    title: t('tasks.create_title', 'Crear Tarea'),
                    presentation: 'formSheet'
                }}
            />
            <ScrollView 
                contentContainerStyle={{ padding: 20, gap: 24 }}
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
            >
                <Input
                    label={t('tasks.form.title', 'Título de la Tarea')}
                    placeholder={t('tasks.form.title_placeholder', 'Ej: Diseñar nueva pantalla')}
                    value={form.title}
                    onChangeText={(val) => {
                        setForm({...form, title: val});
                        if (errors.title) setErrors({...errors, title: ''});
                    }}
                    error={errors.title}
                    required
                />
                
                <View>
                    <Text className="text-secondary-700 dark:text-secondary-300 font-bold mb-3 text-sm uppercase tracking-wider">
                        {t('tasks.form.image', 'Imagen Adjunta')}
                    </Text>
                    
                    {imageUri ? (
                        <View className="relative w-full h-48 rounded-2xl overflow-hidden border border-secondary-200 dark:border-secondary-800">
                            <ExpoImage source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                            <TouchableOpacity 
                                onPress={() => setImageUri(null)}
                                className="absolute top-3 right-3 bg-black/50 w-8 h-8 rounded-full items-center justify-center backdrop-blur-md"
                            >
                                <XMarkIcon size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            onPress={pickImage}
                            className="w-full h-32 rounded-2xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 items-center justify-center bg-white dark:bg-secondary-900/50"
                        >
                            <PhotoIcon size={32} color={theme.primary600} />
                            <Text className="text-secondary-500 dark:text-secondary-400 mt-2 font-bold">
                                {t('tasks.form.add_image', 'Agregar Imagen')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Input
                    label={t('tasks.form.description', 'Descripción')}
                    placeholder={t('tasks.form.description_placeholder', 'Detalles adicionales...')}
                    value={form.description}
                    onChangeText={(val) => setForm({...form, description: val})}
                    multiline
                    numberOfLines={4}
                    style={{ height: 100 }}
                />

                <View>
                    <View className="flex-row items-center gap-2 mb-3">
                        <UserGroupIcon size={16} color={theme.primary600} />
                        <Text className="text-secondary-700 dark:text-secondary-300 font-bold text-sm uppercase tracking-wider">
                            {t('tasks.form.assignees', 'Asignar a miembros')}
                        </Text>
                    </View>
                    {loadingMembers ? (
                        <ActivityIndicator color={theme.primary600} />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
                            {members.map(member => {
                                const isSelected = form.assignee_id === member.id;
                                return (
                                    <TouchableOpacity
                                        key={member.id}
                                        onPress={() => setForm({ ...form, assignee_id: isSelected ? null : member.id })}
                                        className={`mr-3 px-4 py-2.5 rounded-2xl border-2 flex-row items-center ${
                                            isSelected 
                                                ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20' 
                                                : 'bg-white border-secondary-100 dark:bg-secondary-900 dark:border-secondary-800'
                                        }`}
                                    >
                                        <Text className={`font-bold ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-600 dark:text-secondary-400'}`}>
                                            {member.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Select label={t('tasks.form.status', 'Estado')} options={statusOptions} value={form.status} onValueChange={(val) => setForm({...form, status: val})} />
                    </View>
                    <View className="flex-1">
                        <Select label={t('tasks.form.priority', 'Prioridad')} options={priorityOptions} value={form.priority} onValueChange={(val) => setForm({...form, priority: val})} />
                    </View>
                </View>

                <DatePicker label={t('tasks.form.due_date', 'Fecha de Vencimiento')} value={form.due_date} onChange={(date) => setForm({...form, due_date: date})} />

                <View className="mt-4">
                    <PrimaryButton onPress={handleSubmit} loading={loading} className="py-4 rounded-2xl shadow-lg">
                        <Text className="text-white font-black text-lg">
                            {t('common.create', 'Crear Tarea')}
                        </Text>
                    </PrimaryButton>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
