import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import { useWindowDimensions, View, Text, Pressable, ScrollView, Alert, ActivityIndicator, Switch as NativeSwitch } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme, useTranslate } from "../../../src/shared/hooks";
import { projectsApi } from "../../../src/services/api";
import { useProjectStore } from "../../../src/stores/projectStore";
import { useDashboardStore } from "../../../src/stores/dashboardStore";
import { THEME_OPTIONS } from "../../../src/shared/themes";
import { 
    FolderIcon, CheckIcon, CurrencyDollarIcon, CameraIcon, 
    ExclamationTriangleIcon, CheckCircleIcon, CheckListIcon,
    PackageIcon, FactoryIcon, ChatIcon
} from "../../../src/shared/icons";
import Input from "../../../src/shared/components/Input";
import PrimaryButton from "../../../src/shared/components/PrimaryButton";
import DangerButton from "../../../src/shared/components/DangerButton";
import Modal from "../../../src/shared/components/Modal";
import { resolveImageUrl } from "../../../src/shared/utils/image";
import { AppImage } from "../../../src/shared/components/media/AppImage";

function EditProjectScreen() {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeProject, setActiveProject, clearActiveProject } = useProjectStore();
    const { fetchProjects } = useDashboardStore();

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [feedback, setFeedback] = useState<{ visible: boolean; type: 'success' | 'error'; message: string }>({ 
        visible: false, type: 'success', message: '' 
    });
    
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        theme: 'purple-modern',
        typography: 'sans',
        moneda_default: 'COP',
        modules: [] as string[]
    });

    useEffect(() => {
        if (activeProject) {
            setForm({
                nombre: activeProject.nombre || '',
                descripcion: activeProject.descripcion || '',
                theme: activeProject.theme || 'purple-modern',
                typography: activeProject.typography || 'sans',
                moneda_default: activeProject.moneda_default || 'COP',
                modules: (activeProject.modules || []).map(m => m.toLowerCase())
            });
            setImage(activeProject.image_url || activeProject.image_path || null);
            setImageChanged(false);
        }
    }, [activeProject]);

    // Resolve display image
    const displayImage = useMemo(() => {
        if (imageChanged) return image;
        return resolveImageUrl(image);
    }, [image, imageChanged]);

    const toggleModule = (mod: string) => {
        const lowerMod = mod.toLowerCase();
        setForm(prev => ({
            ...prev,
            modules: prev.modules.includes(lowerMod)
                ? prev.modules.filter(m => m !== lowerMod)
                : [...prev.modules, lowerMod]
        }));
    };

    const handleUpdate = async () => {
        if (!form.nombre.trim() || !activeProject) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('nombre', form.nombre);
            formData.append('descripcion', form.descripcion || '');
            formData.append('theme', form.theme);
            formData.append('typography', form.typography);
            formData.append('moneda_default', form.moneda_default);
            
            // Add modules
            form.modules.forEach(m => formData.append('modules[]', m));
            
            if (imageChanged && image) {
                const filename = image.split('/').pop() || 'project.jpg';
                const match = /\.(\w+)$/.exec(filename);
                // @ts-ignore
                formData.append('image', { uri: image, name: filename, type: match ? `image/${match[1]}` : `image/jpeg` });
            }

            const response = await projectsApi.update(activeProject.id, formData);
            setActiveProject(response.data.proyecto || response.data);
            await fetchProjects();
            setFeedback({ visible: true, type: 'success', message: t('projects.update_success') });
        } catch (error: any) {
            console.error('Update error:', error.response?.data || error.message);
            setFeedback({ visible: true, type: 'error', message: t('projects.update_error') });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(t('projects.delete_title'), t('projects.delete_confirm'), [
            { text: t('common.cancel'), style: 'cancel' },
            { 
                text: t('common.delete'), 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await projectsApi.delete(activeProject.id);
                        clearActiveProject();
                        await fetchProjects();
                        router.replace('/(app)');
                    } catch (error) {
                        Alert.alert(t('common.error'), t('projects.delete_error'));
                    }
                }
            }
        ]);
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchImageLibraryAsync({ 
            mediaTypes: ['images'], 
            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.4 
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageChanged(true);
        }
    };

    if (!activeProject) return <ActivityIndicator size="large" className="mt-20" color={theme.primary600} />;

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150, paddingTop: 24 }}>
                <View className="px-6 mb-8 items-center">
                    <Pressable onPress={handlePickImage} className="w-32 h-32 rounded-[32px] bg-white dark:bg-secondary-800 border-2 border-dashed border-secondary-300 dark:border-secondary-600 items-center justify-center overflow-hidden shadow-sm">
                        {displayImage ? <AppImage source={{ uri: displayImage }} contentFit="cover" /> : 
                        <View className="items-center"><CameraIcon size={28} color={theme.primary600} /><Text className="text-[10px] font-black text-secondary-400 uppercase mt-1">Logo</Text></View>}
                    </Pressable>
                </View>

                <View className="px-6 mb-6">
                    <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                        <Text className="text-xl font-black text-secondary-900 dark:text-white mb-6">{t('projects.edit_project')}</Text>
                        <Input label={t('projects.name')} value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
                        <View className="mt-4">
                            <Input label={t('projects.description')} value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} multiline numberOfLines={2} />
                        </View>
                    </View>
                </View>

                <View className="px-6 mb-6">
                    <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                        <Text className="text-xl font-black text-secondary-900 dark:text-white mb-6">{t('projects.modules.title', 'Módulos del Proyecto')}</Text>
                        
                        <View className="gap-4">
                            {[
                                { id: 'finance', label: t('finance.title'), icon: CurrencyDollarIcon },
                                { id: 'tasks', label: t('tasks.title'), icon: CheckListIcon },
                                { id: 'inventory', label: t('inventory.title'), icon: PackageIcon },
                                { id: 'operations', label: t('operations.title'), icon: FactoryIcon },
                                { id: 'chat', label: t('chat.title'), icon: ChatIcon },
                            ].map((mod) => (
                                <View key={mod.id} className="flex-row items-center justify-between py-2 border-b border-secondary-50 dark:border-secondary-800/50">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-800 items-center justify-center mr-4">
                                            <mod.icon size={20} color={form.modules.includes(mod.id) ? theme.primary600 : (isDark ? '#4b5563' : '#9ca3af')} />
                                        </View>
                                        <Text className={`text-base font-bold ${form.modules.includes(mod.id) ? 'text-secondary-900 dark:text-white' : 'text-secondary-400'}`}>{mod.label}</Text>
                                    </View>
                                    <NativeSwitch
                                        value={form.modules.includes(mod.id)}
                                        onValueChange={() => toggleModule(mod.id)}
                                        trackColor={{ false: isDark ? '#374151' : '#d1d5db', true: theme.primary600 }}
                                        thumbColor="#fff"
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <View className="px-6 mb-10">
                    <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                        <Text className="text-xl font-black text-secondary-900 dark:text-white mb-6">{t('projects.visual_style')}</Text>
                        <View className="flex-row flex-wrap gap-4 justify-between">
                            {THEME_OPTIONS.map((opt) => (
                                <Pressable key={opt.id} onPress={() => setForm({ ...form, theme: opt.id })} style={{ backgroundColor: opt.color, borderColor: form.theme === opt.id ? (isDark ? '#fff' : '#000') : 'transparent', transform: [{ scale: form.theme === opt.id ? 1.15 : 1 }] }} className="w-12 h-12 rounded-full border-[3px] items-center justify-center shadow-md">
                                    {form.theme === opt.id && <CheckIcon size={20} color="white" />}
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>

                <View className="px-6 mb-10">
                    <DangerButton onPress={handleDelete} variant="soft">{t('projects.delete_button')}</DangerButton>
                </View>

                <View className="px-6 mb-10">
                    <PrimaryButton onPress={handleUpdate} loading={loading} size="xl">{t('common.save_changes')}</PrimaryButton>
                </View>
            </ScrollView>

            <Modal 
                visible={feedback.visible} 
                onClose={() => { 
                    setFeedback({ ...feedback, visible: false }); 
                    if (feedback.type === 'success') router.push('/(app)'); 
                }} 
                title={feedback.type === 'success' ? t('common.success') : t('common.error')}
                headerTextColor={feedback.type === 'success' ? '#10b981' : '#ef4444'}
            >
                <View className="items-center pt-10 pb-16 px-6">
                    {feedback.type === 'success' ? (
                        <CheckCircleIcon size={72} color="#10b981" />
                    ) : (
                        <ExclamationTriangleIcon size={72} color="#ef4444" />
                    )}
                    <Text className="text-xl font-black text-center mt-6 text-secondary-900 dark:text-white">
                        {feedback.message}
                    </Text>
                </View>
            </Modal>
        </View>
    );
}

export default memo(EditProjectScreen);
