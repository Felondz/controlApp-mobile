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
                className={`flex-row items-center justify-between p-4 bg-white dark:bg-secondary-800 rounded-3xl border border-secondary-200 dark:border-secondary-700 shadow-sm active:opacity-80 overflow-hidden relative`}
            >
                {/* Safe opacity overlay */}
                <View className="absolute inset-0 bg-secondary-50 dark:bg-secondary-900 opacity-20" pointerEvents="none" />
                
                <View className="flex-row items-center flex-1 z-10">
                    <View 
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4 border"
                        style={{ backgroundColor: isDark ? theme.primary900 : theme.primary50, borderColor: isDark ? theme.primary800 : theme.primary100 }}
                    >
                        <FolderIcon size={24} color={theme.primary500} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: theme.primary600 }}>
                            {t('dashboard.current_project', 'Proyecto Activo')}
                        </Text>
                        <Text className="text-lg font-black text-secondary-900 dark:text-secondary-100" numberOfLines={1}>
                            {activeProject?.nombre}
                        </Text>
                    </View>
                </View>
                <View className="z-10">
                    <ChevronDownIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </View>
            </Pressable>

            {showProjectPicker && (
                <View className="mt-2 bg-white dark:bg-secondary-800 rounded-3xl border border-secondary-200 dark:border-secondary-700 shadow-2xl overflow-hidden z-50">
                    <ScrollView className="max-h-72">
                        {projects.map((project) => {
                            const isSelected = project.id === activeProject?.id;
                            return (
                                <Pressable
                                    key={project.id}
                                    onPress={() => handleSelectProject(project)}
                                    className="flex-row items-center p-5 border-b border-secondary-100 dark:border-secondary-700/50 active:bg-secondary-50 dark:active:bg-secondary-700 relative overflow-hidden"
                                    style={isSelected ? { backgroundColor: isDark ? theme.primary900 : theme.primary100 } : undefined}
                                >
                                    {isSelected && (
                                        <View className="absolute inset-0 bg-white dark:bg-black opacity-20" pointerEvents="none" />
                                    )}
                                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 z-10" style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                                        <FolderIcon size={20} color={isSelected ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                                    </View>
                                    <Text className={`flex-1 font-bold z-10 ${isSelected ? (isDark ? 'text-white' : 'text-secondary-900') : (isDark ? 'text-secondary-400' : 'text-secondary-600')}`}>
                                        {project.nombre}
                                    </Text>
                                    {isSelected && (
                                        <View className="z-10">
                                            <CheckIcon size={20} color={theme.primary500} />
                                        </View>
                                    )}
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
                                        className="bg-white dark:bg-secondary-800 rounded-2xl p-4 border border-secondary-200 dark:border-secondary-700 flex-1 min-w-[140px] items-center active:bg-secondary-50 dark:active:bg-secondary-700 overflow-hidden relative"
                                    >
                                        <View 
                                            className="w-10 h-10 rounded-xl items-center justify-center mb-2 z-10 overflow-hidden border"
                                            style={{ backgroundColor: theme.primary600, borderColor: theme.primary700 }}
                                        >
                                            <View className="absolute inset-0 bg-white opacity-80" pointerEvents="none" />
                                            <CalculatorIcon size={24} color={theme.primary600} />
                                        </View>
                                        <Text className="font-bold text-secondary-900 dark:text-secondary-100 text-xs z-10">Finanzas</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => router.push('/(app)/inventory')}
                                        className="bg-white dark:bg-secondary-800 rounded-2xl p-4 border border-secondary-200 dark:border-secondary-700 flex-1 min-w-[140px] items-center active:bg-secondary-50 dark:active:bg-secondary-700 overflow-hidden relative"
                                    >
                                        <View 
                                            className="w-10 h-10 rounded-xl items-center justify-center mb-2 z-10 overflow-hidden border"
                                            style={{ backgroundColor: theme.primary600, borderColor: theme.primary700 }}
                                        >
                                            <View className="absolute inset-0 bg-white opacity-80" pointerEvents="none" />
                                            <PackageIcon size={24} color={theme.primary600} />
                                        </View>
                                        <Text className="font-bold text-secondary-900 dark:text-secondary-100 text-xs z-10">Inventario</Text>
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
