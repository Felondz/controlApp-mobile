import React, { useEffect, useState, memo } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from "../../src/stores/authStore";
import { useDashboardStore } from "../../src/stores/dashboardStore";
import { useProjectStore, Proyecto } from "../../src/stores/projectStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useTranslate, useAppTheme } from "../../src/shared/hooks";
import { 
    PlusIcon, FolderIcon, 
    CalculatorIcon, PackageIcon, FactoryIcon, PuzzleIcon, UsersIcon,
    Cog6ToothIcon, CheckIcon
} from "../../src/shared/icons";
import { Project } from "../../src/stores/dashboardStore";
import { ProjectCard } from '../../src/modules/projects/components/ProjectCard';
import { Modal, Checkbox } from '../../src/shared/components';
import { getTheme } from '../../src/shared/themes';

// Widgets
import { BalanceSummaryWidget } from '../../src/modules/finance/widgets/BalanceSummaryWidget';
import { InventorySummaryWidget } from '../../src/modules/inventory/widgets/InventorySummaryWidget';
import { OperationsSummaryWidget } from '../../src/modules/operations/widgets/OperationsSummaryWidget';
import { TasksSummaryWidget } from '../../src/modules/tasks/tasks/TasksSummaryWidget'; // Fix path if needed
import { ChatWidget } from '../../src/modules/chat/widgets/ChatWidget';
import { AccountUsageChartWidget } from '../../src/modules/finance/widgets/AccountUsageChartWidget';
import { useCuentas } from '../../src/hooks/graphql/useFinance';

// Dashboard Screen Component
function DashboardScreen() {
    const { user } = useAuthStore();
    const { projects, fetchProjects, isLoading: dashboardLoading } = useDashboardStore();
    const { activeProject, setActiveProject, loadActiveProject, isLoading: projectLoading } = useProjectStore();
    const { visibleWidgets, toggleWidget } = useSettingsStore();
    const { theme: globalTheme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    const { t } = useTranslate();
    const router = useRouter();
    const [showWidgetSettings, setShowWidgetSettings] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Centralized Data for Finance Widgets in Overview
    const proyectoId = activeProject?.id || 0;
    const { data: cuentasData, isLoading: loadingCuentas } = useCuentas(proyectoId);
    const cuentas = Array.isArray(cuentasData) ? cuentasData : [];

    const isTablet = width >= 768;
    const isLoading = dashboardLoading || projectLoading;

    // Get project-specific theme
    const projectTheme = getTheme(activeProject?.theme || 'purple-modern');

    useEffect(() => {
        setIsMounted(true);
        const loadData = async () => {
            await fetchProjects();
            await loadActiveProject();
        };
        loadData();
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
    };

    if (!isMounted || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#030712' : '#f9fafb' }}>
                <ActivityIndicator size="large" color={globalTheme.primary500} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {activeProject ? (
                    <View className="mt-2">
                        <View className="flex-row items-center justify-end mb-6 px-1">
                            <TouchableOpacity 
                                onPress={() => setShowWidgetSettings(true)}
                                className="w-12 h-12 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-800 items-center justify-center shadow-sm active:scale-95 transition-all"
                                style={{ borderColor: `${projectTheme.primary500}30` }}
                            >
                                <Cog6ToothIcon size={24} color={projectTheme.primary600} />
                            </TouchableOpacity>
                        </View>
                        
                        <View className="gap-6">
                            {visibleWidgets.finance_balance && (activeProject.modules?.some(m => m.toLowerCase() === 'finance') || true) && (
                                <BalanceSummaryWidget 
                                    totalBalance={cuentas.reduce((acc, c) => acc + (c.saldo_actual || 0), 0)}
                                    accountCount={cuentas.length}
                                    t={t}
                                />
                            )}

                            {visibleWidgets.finance_charts && (activeProject.modules?.some(m => m.toLowerCase() === 'finance') || true) && (
                                <AccountUsageChartWidget 
                                    cuentas={cuentas}
                                    t={t}
                                    theme={projectTheme}
                                    isDark={isDark}
                                    isLoading={loadingCuentas}
                                />
                            )}

                            {visibleWidgets.inventory && (activeProject.modules?.includes('Inventory') || true) && (
                                <InventorySummaryWidget proyectoId={activeProject.id} />
                            )}

                            {visibleWidgets.operations && (activeProject.modules?.includes('Operations') || true) && (
                                <OperationsSummaryWidget proyectoId={activeProject.id} />
                            )}

                            <View className="mt-4">
                                <Text className="text-sm font-black text-secondary-400 dark:text-secondary-500 tracking-widest mb-4 ml-1">
                                    {t('dashboard.quick_access')}
                                </Text>
                                <View className="flex-row flex-wrap gap-4">
                                    <Pressable 
                                        onPress={() => router.push('/(app)/finance')}
                                        className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800 flex-1 min-w-[140px] items-center active:bg-secondary-50 dark:active:bg-secondary-800 shadow-sm"
                                    >
                                        <View className="mb-3">
                                            <CalculatorIcon size={32} color={projectTheme.primary600} />
                                        </View>
                                        <Text className="font-black text-secondary-900 dark:text-secondary-100 text-sm tracking-widest">{t('finance.title')}</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => router.push('/(app)/inventory')}
                                        className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800 flex-1 min-w-[140px] items-center active:bg-secondary-50 dark:active:bg-secondary-800 shadow-sm"
                                    >
                                        <View className="mb-3">
                                            <PackageIcon size={32} color={projectTheme.primary600} />
                                        </View>
                                        <Text className="font-black text-secondary-900 dark:text-secondary-100 text-sm tracking-widest">{t('inventory.title')}</Text>
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
                                style={{ color: globalTheme.primary600 }}
                            >
                                {t('projects.your_projects', 'Mis Proyectos')}
                            </Text>
                            <View 
                                className="px-3 py-1 rounded-full border"
                                style={{ 
                                    backgroundColor: isDark ? globalTheme.primary900 : globalTheme.primary100,
                                    borderColor: isDark ? globalTheme.primary800 : globalTheme.primary200
                                }}
                            >
                                <Text 
                                    className="text-sm font-black"
                                    style={{ color: globalTheme.primary600 }}
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
                                        backgroundColor: isDark ? `${globalTheme.primary900}20` : `${globalTheme.primary50}50`,
                                        borderColor: isDark ? globalTheme.primary800 : theme.primary300
                                    }}
                                >
                                    <View 
                                        className="w-12 h-12 rounded-full items-center justify-center mb-4 shadow-sm border"
                                        style={{ 
                                            backgroundColor: isDark ? globalTheme.primary800 : '#ffffff',
                                            borderColor: isDark ? globalTheme.primary700 : globalTheme.primary100
                                        }}
                                    >
                                        <PlusIcon size={24} color={globalTheme.primary600} />
                                    </View>
                                    <Text 
                                        className="font-bold"
                                        style={{ color: isDark ? globalTheme.primary400 : globalTheme.primary700 }}
                                    >
                                        {t('projects.new_project', 'Nuevo Proyecto')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {!activeProject && (
                <Pressable
                    onPress={() => router.push('/(app)/projects/new')}
                    className="absolute bottom-8 right-6 w-16 h-16 rounded-full shadow-2xl shadow-primary-600/40 justify-center items-center z-50 active:scale-90 transition-all"
                    style={{ backgroundColor: globalTheme.primary600 }}
                >
                    <PlusIcon size={30} color="#ffffff" />
                </Pressable>
            )}

            <Modal
                visible={showWidgetSettings}
                onClose={() => setShowWidgetSettings(false)}
                title={t('dashboard.manage_widgets')}
                headerBackgroundColor={projectTheme.primary500}
                headerTextColor="white"
            >
                <ScrollView 
                    className="max-h-[500px]" 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16 }}
                >
                    <View className="gap-3">
                        {[
                            { key: 'finance_balance', label: t('dashboard.widgets.finance_balance'), icon: CalculatorIcon },
                            { key: 'finance_charts', label: t('dashboard.widgets.finance_charts'), icon: CalculatorIcon },
                            { key: 'tasks', label: t('dashboard.widgets.tasks'), icon: CheckIcon },
                            { key: 'chat', label: t('dashboard.widgets.chat'), icon: UsersIcon },
                            { key: 'inventory', label: t('dashboard.widgets.inventory'), icon: PackageIcon },
                            { key: 'operations', label: t('dashboard.widgets.operations'), icon: FactoryIcon },
                        ].map((widget) => {
                            const isVisible = visibleWidgets[widget.key];
                            return (
                                <Pressable
                                    key={widget.key}
                                    onPress={() => toggleWidget(widget.key)}
                                    className={`flex-row items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${
                                        isVisible 
                                            ? 'bg-primary-50/30 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30' 
                                            : 'bg-white dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                                    }`}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                                            isVisible ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-secondary-50 dark:bg-secondary-800'
                                        }`}>
                                            <widget.icon size={22} color={isVisible ? projectTheme.primary600 : (isDark ? '#4b5563' : '#9ca3af')} />
                                        </View>
                                        <Text className={`font-black text-base flex-1 ${
                                            isVisible ? 'text-secondary-900 dark:text-white' : 'text-secondary-500 dark:text-secondary-400'
                                        }`}>
                                            {widget.label}
                                        </Text>
                                    </View>
                                    <Checkbox 
                                        checked={isVisible} 
                                        onChange={() => toggleWidget(widget.key)}
                                    />
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
}

export default DashboardScreen;
