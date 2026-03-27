import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import { projectsApi } from '../../../src/services/api';
import { useDashboardStore } from '../../../src/stores/dashboardStore';
import { THEME_OPTIONS } from '../../../src/shared/themes';
import { 
    FolderIcon, 
    CheckIcon,
    PuzzleIcon,
    QueueListIcon,
    CurrencyDollarIcon,
    SparklesIcon,
    WrenchScrewdriverIcon,
    CameraIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    ChatIcon,
    CheckListIcon,
    UsersIcon,
    LockClosedIcon
} from '../../../src/shared/icons';
import Input from '../../../src/shared/components/Input';
import PrimaryButton from '../../../src/shared/components/PrimaryButton';

// Mapeo estático fuera del componente para evitar re-creaciones que rompan el contexto
const ICONS: Record<string, React.FC<any>> = {
    finance: CurrencyDollarIcon,
    tasks: CheckListIcon,
    chat: ChatIcon,
    inventory: FolderIcon,
    operations: QueueListIcon,
    crm: UsersIcon,
    freelancer: BriefcaseIcon,
    startup: SparklesIcon,
    event_planning: BriefcaseIcon,
    education: AcademicCapIcon,
    enterprise: WrenchScrewdriverIcon,
};

const PROJECT_TEMPLATES = [
    { id: 'freelancer', modules: ['finance', 'tasks'], iconName: 'freelancer' },
    { id: 'startup', modules: ['finance', 'tasks', 'chat', 'inventory', 'operations'], iconName: 'startup' },
    { id: 'event_planning', modules: ['finance', 'tasks', 'chat'], iconName: 'event_planning' },
    { id: 'education', modules: ['tasks', 'chat'], iconName: 'education' },
    { id: 'enterprise', modules: ['finance', 'tasks', 'inventory', 'operations', 'crm'], iconName: 'enterprise', coming_soon: true }
];

const AVAILABLE_MODULES = [
    { id: 'finance', iconName: 'finance' },
    { id: 'tasks', iconName: 'tasks' },
    { id: 'chat', iconName: 'chat' },
    { id: 'inventory', iconName: 'inventory' },
    { id: 'operations', iconName: 'operations' },
    { id: 'crm', iconName: 'crm', coming_soon: true },
];

const MODULE_DEPENDENCIES: Record<string, string[]> = {
    inventory: ['finance'],
    operations: ['finance', 'tasks'],
};

const CURRENCIES = [
    { code: 'COP', symbol: '$' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
];

function NewProjectScreen() {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    const { fetchProjects } = useDashboardStore();

    const [loading, setLoading] = useState(false);
    const [creationMode, setCreationMode] = useState<'template' | 'custom'>('template');
    const [image, setImage] = useState<string | null>(null);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        theme: 'purple-modern',
        moneda_default: 'COP',
        modules: ['finance']
    });

    const handleTemplateSelect = (template: any) => {
        if (template.coming_soon) return;
        setForm(prev => ({ ...prev, modules: [...template.modules] }));
    };

    const isTemplateSelected = (templateModules: string[]) => {
        return JSON.stringify([...form.modules].sort()) === JSON.stringify([...templateModules].sort());
    };

    const toggleModule = (moduleKey: string) => {
        const isActive = form.modules.includes(moduleKey);
        if (isActive) {
            const dependents = Object.keys(MODULE_DEPENDENCIES).filter(key =>
                MODULE_DEPENDENCIES[key].includes(moduleKey) && form.modules.includes(key)
            );
            if (dependents.length > 0) {
                const depNames = dependents.map(d => t(`projects.modules.${d}`)).join(', ');
                Alert.alert(t('common.error'), `No puedes desactivar este módulo porque ${depNames} depende(n) de él.`);
                return;
            }
            setForm(prev => ({ ...prev, modules: prev.modules.filter(m => m !== moduleKey) }));
        } else {
            const dependencies = MODULE_DEPENDENCIES[moduleKey] || [];
            const missingDeps = dependencies.filter(d => !form.modules.includes(d));
            if (missingDeps.length > 0) {
                const missingNames = missingDeps.map(d => t(`projects.modules.${d}`)).join(', ');
                Alert.alert(t('common.error'), `Para activar este módulo, primero debes activar: ${missingNames}.`);
                return;
            }
            setForm(prev => ({ ...prev, modules: [...prev.modules, moduleKey] }));
        }
    };

    const handleCreate = async () => {
        if (!form.nombre.trim()) {
            Alert.alert(t('common.error'), t('projects.name_required'));
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('nombre', form.nombre);
            formData.append('descripcion', form.descripcion);
            formData.append('theme', form.theme);
            formData.append('moneda_default', form.moneda_default);
            form.modules.forEach(m => formData.append('modules[]', m));
            if (image) {
                const filename = image.split('/').pop() || 'project.jpg';
                const match = /\.(\w+)$/.exec(filename);
                // @ts-ignore
                formData.append('image', { uri: image, name: filename, type: match ? `image/${match[1]}` : `image/jpeg` });
            }
            await projectsApi.create(formData);
            await fetchProjects();
            router.replace('/(app)');
        } catch (error) {
            Alert.alert(t('common.error'), t('projects.create_error'));
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }}>
                {/* Image Picker */}
                <View className="px-6 mb-8 items-center">
                    <Pressable onPress={handlePickImage} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} className="w-32 h-32 rounded-2xl bg-white dark:bg-secondary-800 border-2 border-dashed border-secondary-300 dark:border-secondary-600 items-center justify-center overflow-hidden shadow-sm">
                        {image ? <Image source={{ uri: image }} className="w-full h-full" /> : 
                        <View className="items-center">
                            <CameraIcon size={24} color={theme.primary600} />
                            <Text className="text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">Logo</Text>
                        </View>}
                    </Pressable>
                </View>

                {/* Basic Info */}
                <View className="px-6 mb-6">
                    <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                        <Text className="text-xl font-black text-secondary-900 dark:text-white tracking-tighter mb-6">{t('projects.basic_info')}</Text>
                        <View className="gap-6">
                            <Input label={t('projects.name')} placeholder={t('projects.name_placeholder')} value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
                            <Input label={t('projects.description')} placeholder={t('projects.desc_placeholder')} value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} multiline numberOfLines={2} />
                            <View>
                                <Text className="text-xs font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest mb-3">{t('projects.currency')}</Text>
                                <View className="flex-row gap-3">
                                    {CURRENCIES.map((curr) => {
                                        const isSel = form.moneda_default === curr.code;
                                        return (
                                            <Pressable key={curr.code} onPress={() => setForm({ ...form, moneda_default: curr.code })} className={`flex-1 py-3 rounded-2xl border-2 items-center justify-center ${isSel ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-secondary-200 dark:border-secondary-800'}`} style={isSel ? { borderColor: theme.primary500 } : {}}>
                                                <Text className={`font-black text-base ${isSel ? 'text-secondary-900 dark:text-white' : 'text-secondary-500 dark:text-secondary-400'}`}>{curr.code}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Module Config */}
                <View className="px-6 mb-6">
                    <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-black text-secondary-900 dark:text-white tracking-tighter">{t('projects.setup_type')}</Text>
                            <View className="flex-row bg-secondary-100 dark:bg-secondary-800 rounded-xl p-1">
                                <Pressable 
                                    onPress={() => setCreationMode('template')} 
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 8,
                                        backgroundColor: creationMode === 'template' ? (isDark ? '#374151' : '#ffffff') : 'transparent',
                                        ...(creationMode === 'template' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 } : {})
                                    }}
                                >
                                    <Text className={`text-[10px] font-black uppercase ${creationMode === 'template' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500'}`}>{t('projects.template_mode')}</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={() => setCreationMode('custom')} 
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 8,
                                        backgroundColor: creationMode === 'custom' ? (isDark ? '#374151' : '#ffffff') : 'transparent',
                                        ...(creationMode === 'custom' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 } : {})
                                    }}
                                >
                                    <Text className={`text-[10px] font-black uppercase ${creationMode === 'custom' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500'}`}>{t('projects.custom_mode')}</Text>
                                </Pressable>
                            </View>
                        </View>

                        {creationMode === 'template' ? (
                            <View className="gap-4">
                                {PROJECT_TEMPLATES.map((tmpl) => {
                                    const isSel = isTemplateSelected(tmpl.modules);
                                    const IconComp = ICONS[tmpl.iconName] || FolderIcon;
                                    return (
                                        <Pressable 
                                            key={tmpl.id} 
                                            style={({ pressed }) => [{ opacity: (pressed || tmpl.coming_soon) ? 0.5 : 1 }, isSel ? { borderColor: theme.primary500 } : {}]} 
                                            onPress={() => handleTemplateSelect(tmpl)} 
                                            disabled={tmpl.coming_soon} 
                                            className={`p-4 rounded-2xl border-2 flex-row items-center ${isSel ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-secondary-200 dark:border-secondary-800'} ${tmpl.coming_soon ? 'opacity-50' : ''}`}
                                        >
                                            <View className="w-12 h-12 rounded-xl bg-secondary-50 dark:bg-secondary-800 items-center justify-center mr-4">
                                                <IconComp size={24} color={isSel ? theme.primary600 : '#6b7280'} />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center gap-2">
                                                    <Text className={`font-black text-base ${isSel ? 'text-secondary-900 dark:text-white' : 'text-secondary-600 dark:text-secondary-400'}`}>{t(`projects.templates.${tmpl.id}`)}</Text>
                                                    {tmpl.coming_soon && <Text className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase font-black">Soon</Text>}
                                                </View>
                                                <Text className="text-[11px] text-secondary-500 dark:text-secondary-400 font-medium mt-0.5" numberOfLines={1}>{t(`projects.templates.${tmpl.id}_desc`)}</Text>
                                            </View>
                                            {isSel && <CheckIcon size={20} color={theme.primary600} />}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ) : (
                            <View className="flex-row flex-wrap gap-3">
                                {AVAILABLE_MODULES.map((mod) => {
                                    const isEn = form.modules.includes(mod.id);
                                    const IconComp = ICONS[mod.iconName] || FolderIcon;
                                    const reqs = MODULE_DEPENDENCIES[mod.id] || [];
                                    const isLck = !reqs.every(d => form.modules.includes(d)) && !mod.coming_soon;
                                    return (
                                        <Pressable 
                                            key={mod.id} 
                                            style={({ pressed }) => [{ opacity: (pressed || mod.coming_soon || isLck) ? 0.5 : 1 }, isEn ? { borderColor: theme.primary500 } : {}]} 
                                            onPress={() => !mod.coming_soon && toggleModule(mod.id)} 
                                            className={`flex-1 min-w-[45%] p-4 rounded-2xl border-2 items-center ${isEn ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-secondary-200 dark:border-secondary-800'} ${mod.coming_soon || isLck ? 'opacity-50' : ''}`}
                                        >
                                            {isLck ? <LockClosedIcon size={24} color="#9ca3af" /> : <IconComp size={24} color={isEn ? theme.primary600 : '#6b7280'} />}
                                            <Text className={`mt-3 font-bold text-xs uppercase tracking-wider ${isEn ? 'text-secondary-900 dark:text-white' : 'text-secondary-500 dark:text-secondary-400'}`}>{t(`projects.modules.${mod.id}`)}</Text>
                                            {isLck && <Text className="text-[8px] text-red-500 font-bold mt-1 text-center">Req: {reqs.join(', ')}</Text>}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </View>

                {/* Visual Style */}
                <View className="px-6 mb-6">
                    <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                        <Text className="text-xl font-black text-secondary-900 dark:text-white tracking-tighter mb-6">{t('projects.visual_style')}</Text>
                        <View className="flex-row flex-wrap gap-4">
                            {THEME_OPTIONS.map((opt) => (
                                <Pressable 
                                    key={opt.id} 
                                    onPress={() => setForm({ ...form, theme: opt.id })} 
                                    style={({ pressed }) => [{ 
                                        backgroundColor: opt.color, 
                                        borderColor: form.theme === opt.id ? (isDark ? '#ffffff' : '#111827') : 'transparent',
                                        opacity: pressed ? 0.8 : 1,
                                        transform: [{ scale: form.theme === opt.id ? 1.1 : 1 }]
                                    }]}
                                    className={`w-12 h-12 rounded-full border-[3px] items-center justify-center shadow-sm`}
                                >
                                    {form.theme === opt.id && <CheckIcon size={18} color="white" />}
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl border-t border-secondary-200 dark:border-secondary-800">
                <PrimaryButton onPress={handleCreate} loading={loading} size="xl">{t('projects.create_button')}</PrimaryButton>
            </View>
        </View>
    );
}

export default React.memo(NewProjectScreen);
