import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from "../../src/stores/authStore";
import { useDashboardStore } from "../../src/stores/dashboardStore";
import { useProjectStore, Proyecto } from "../../src/stores/projectStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useTranslate, useAppTheme } from "../../src/shared/hooks";
import { 
    PlusIcon, CheckIcon, FolderIcon, ChevronDownIcon, 
    CalculatorIcon, PackageIcon, FactoryIcon, PuzzleIcon, UsersIcon 
} from "../../src/shared/icons";
import { Project } from "../../src/stores/dashboardStore";
import { ProjectCard } from '../../src/modules/projects/components/ProjectCard';

// Widgets
import { BalanceWidget } from '../../src/modules/finance/widgets/BalanceWidget';
import { InventorySummaryWidget } from '../../src/modules/inventory/widgets/InventorySummaryWidget';
import { OperationsSummaryWidget } from '../../src/modules/operations/widgets/OperationsSummaryWidget';

export default function DashboardScreen() {
    const { user } = useAuthStore();
    const { projects, fetchProjects, isLoading: dashboardLoading } = useDashboardStore();
    const { activeProject, setActiveProject, loadActiveProject, isLoading: projectLoading } = useProjectStore();
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    const { t } = useTranslate();
    const router = useRouter();
    const [showProjectPicker, setShowProjectPicker] = useState(false);

    const isTablet = width >= 768;
    const isLoading = dashboardLoading || projectLoading;

    useEffect(() => {
        fetchProjects();
        loadActiveProject();
    }, []);

    const handleSelectProject = async (project: Project) => {
        const proyecto: Proyecto = {
            id: project.id,
            nombre: project.nombre,
            descripcion: project.descripcion,
            modules: project.modules,
            theme: project.theme,
            image_url: project.image_url,
        };
        await setActiveProject(proyecto);
        setShowProjectPicker(false);
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary-50 dark:bg-secondary-950">
                <ActivityIndicator size="large" color={theme.primary500} />
            </View>
        );
    }

    const ProjectSelector = () => (
        <View className="mb-8">
            <Pressable 
                onPress={() => setShowProjectPicker(!showProjectPicker)}
                className={`flex-row items-center justify-between p-5 bg-white dark:bg-secondary-900 rounded-[32px] border border-secondary-200 dark:border-secondary-800 shadow-sm active:opacity-80 overflow-hidden`}
            >
                <View className="flex-row items-center flex-1">
                    <View className="mr-4">
                        <FolderIcon size={28} color={theme.primary600} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[10px] font-black uppercase tracking-[2px] mb-0.5" style={{ color: theme.primary600 }}>
                            {t('dashboard.current_project')}
                        </Text>
                        <Text className="text-xl font-black text-secondary-900 dark:text-secondary-50" numberOfLines={1}>
                            {activeProject?.nombre}
                        </Text>
                    </View>
                </View>
                <View className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-800 items-center justify-center">
                    <ChevronDownIcon size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                </View>
            </Pressable>

            {showProjectPicker && (
                <View className="mt-3 bg-white dark:bg-secondary-900 rounded-[32px] border border-secondary-200 dark:border-secondary-800 shadow-2xl overflow-hidden z-50">
                    <ScrollView className="max-h-72">
                        {projects.map((project) => {
                            const isSelected = project.id === activeProject?.id;
                            return (
                                <Pressable
                                    key={project.id}
                                    onPress={() => handleSelectProject(project)}
                                    className={`flex-row items-center p-5 border-b border-secondary-100 dark:border-secondary-800/50 active:bg-secondary-50 dark:active:bg-secondary-800 ${isSelected ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                                >
                                    <View className="mr-4">
                                        <FolderIcon size={22} color={isSelected ? theme.primary600 : (isDark ? '#4b5563' : '#9ca3af')} />
                                    </View>
                                    <Text className={`flex-1 font-bold text-base ${isSelected ? (isDark ? 'text-white' : 'text-secondary-900') : (isDark ? 'text-secondary-400' : 'text-secondary-600')}`}>
                                        {project.nombre}
                                    </Text>
                                    {isSelected && <CheckIcon size={20} color={theme.primary500} />}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    return (
        <View className="flex-1">
            <ScrollView 
                className="flex-1 bg-secondary-50 dark:bg-secondary-950"
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {activeProject ? (
                    <View className="mt-2">
                        <ProjectSelector />
                        
                        <View className="gap-6">
                            {(activeProject.modules?.includes('Finance') || true) && (
                                <BalanceWidget proyectoId={activeProject.id} />
                            )}

                            {(activeProject.modules?.includes('Inventory') || true) && (
                                <InventorySummaryWidget proyectoId={activeProject.id} />
                            )}

                            {(activeProject.modules?.includes('Operations') || true) && (
                                <OperationsSummaryWidget proyectoId={activeProject.id} />
                            )}

                            <View className="mt-4">
                                <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-4 ml-1">
                                    {t('dashboard.quick_access', 'Accesos Rápidos')}
                                </Text>
                                <View className="flex-row flex-wrap gap-4">
                                    <Pressable 
                                        onPress={() => router.push('/(app)/finance')}
                                        className="bg-white dark:bg-secondary-900 rounded-[32px] p-6 border border-secondary-200 dark:border-secondary-800 flex-1 min-w-[140px] items-center active:bg-secondary-50 dark:active:bg-secondary-800 shadow-sm"
                                    >
                                        <View className="mb-3">
                                            <CalculatorIcon size={32} color={theme.primary600} />
                                        </View>
                                        <Text className="font-black text-secondary-900 dark:text-secondary-100 text-xs uppercase tracking-widest">{t('finance.title')}</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => router.push('/(app)/inventory')}
                                        className="bg-white dark:bg-secondary-900 rounded-[32px] p-6 border border-secondary-200 dark:border-secondary-800 flex-1 min-w-[140px] items-center active:bg-secondary-50 dark:active:bg-secondary-800 shadow-sm"
                                    >
                                        <View className="mb-3">
                                            <PackageIcon size={32} color={theme.primary600} />
                                        </View>
                                        <Text className="font-black text-secondary-900 dark:text-secondary-100 text-xs uppercase tracking-widest">{t('inventory.title')}</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="mt-2">
                        <View className="flex-row items-center justify-between mb-8 px-1">
                            <Text 
                                className="text-3xl font-black tracking-tighter"
                                style={{ color: theme.primary600 }}
                            >
                                {t('projects.your_projects', 'Mis Proyectos')}
                            </Text>
                            <View 
                                className="px-3 py-1 rounded-full border"
                                style={{ 
                                    backgroundColor: isDark ? theme.primary900 : theme.primary100,
                                    borderColor: isDark ? theme.primary800 : theme.primary200
                                }}
                            >
                                <Text 
                                    className="text-[10px] font-black"
                                    style={{ color: theme.primary600 }}
                                >
                                    {projects.length}
                                </Text>
                            </View>
                        </View>
                        
                        <View className="flex-row flex-wrap" style={{ marginHorizontal: -8 }}>
                            {projects.map((project) => (
                                <View key={project.id} className="p-2" style={{ width: isTablet ? '33.33%' : '50%' }}>
                                    <ProjectCard 
                                        project={{
                                            ...project,
                                            isAdmin: true, 
                                        }}
                                        onPress={() => handleSelectProject(project)}
                                    />
                                </View>
                            ))}
                            
                            {/* Ghost Creation Card */}
                            <TouchableOpacity 
                                onPress={() => router.push('/(app)/projects/new')}
                                activeOpacity={0.7}
                                className="p-2"
                                style={{ width: isTablet ? '33.33%' : '50%', zIndex: 10 }}
                            >
                                <View 
                                    className="rounded-xl border-2 border-dashed items-center justify-center"
                                    style={{ 
                                        minHeight: 280,
                                        backgroundColor: isDark ? `${theme.primary900}20` : `${theme.primary50}50`,
                                        borderColor: isDark ? theme.primary800 : theme.primary300
                                    }}
                                >
                                    <View 
                                        className="w-12 h-12 rounded-full items-center justify-center mb-4 shadow-sm border"
                                        style={{ 
                                            backgroundColor: isDark ? theme.primary800 : '#ffffff',
                                            borderColor: isDark ? theme.primary700 : theme.primary100
                                        }}
                                    >
                                        <PlusIcon size={24} color={theme.primary600} />
                                    </View>
                                    <Text 
                                        className="font-bold"
                                        style={{ color: isDark ? theme.primary400 : theme.primary700 }}
                                    >
                                        {t('projects.new_project', 'Nuevo Proyecto')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            <Pressable
                onPress={() => router.push('/(app)/projects/new')}
                className="absolute bottom-8 right-6 w-16 h-16 rounded-full shadow-2xl shadow-primary-600/40 justify-center items-center z-50 active:scale-90 transition-all"
                style={{ backgroundColor: theme.primary600 }}
            >
                <PlusIcon size={30} color="#ffffff" />
            </Pressable>
        </View>
    );
}
