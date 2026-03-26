import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useDashboardStore } from "../../../src/stores/dashboardStore";
import { useProjectStore, Proyecto } from "../../../src/stores/projectStore";
import { useSettingsStore } from "../../../src/stores/settingsStore";
import { useTranslate } from "../../../src/shared/hooks";
import { getTheme } from "../../../src/shared/themes";
import { ProjectCard } from '../../../src/modules/projects/components/ProjectCard';
import { PlusIcon, FolderIcon } from '../../../src/shared/icons';

export default function ProjectsListScreen() {
    const { projects, fetchProjects, isLoading } = useDashboardStore();
    const { setActiveProject } = useProjectStore();
    const { theme: currentTheme, isDark } = useSettingsStore();
    const { t } = useTranslate();
    const router = useRouter();
    const theme = getTheme(currentTheme);

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSelectProject = async (project: any) => {
        const proyecto: Proyecto = {
            id: project.id,
            nombre: project.nombre,
            descripcion: project.descripcion,
            modules: project.modules,
            theme: project.theme,
            image_url: project.image_url,
        };
        await setActiveProject(proyecto);
        router.push('/(app)'); // Go to project dashboard
    };

    if (isLoading && projects.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary-50 dark:bg-secondary-950">
                <ActivityIndicator size="large" color={theme.primary500} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950 p-4">
            <FlatList
                data={projects}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <ProjectCard 
                        project={{
                            ...item,
                            isAdmin: true, // Should come from API
                        }}
                        onPress={() => handleSelectProject(item)}
                    />
                )}
                ListHeaderComponent={
                    <View className="mb-6 mt-2 px-1">
                        <Text className="text-2xl font-black text-secondary-900 dark:text-secondary-100 tracking-tight">
                            {t('projects.your_projects') || 'Tus Proyectos'}
                        </Text>
                        <Text className="text-secondary-500 dark:text-secondary-400 font-medium">
                            {t('projects.manage_desc') || 'Gestiona y organiza todos tus proyectos activos.'}
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View className="items-center py-20 px-8">
                        <View className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full items-center justify-center mb-6">
                            <FolderIcon size={40} color={isDark ? '#4b5563' : '#9ca3af'} />
                        </View>
                        <Text className="text-xl font-bold text-secondary-900 dark:text-secondary-100 text-center mb-2">
                            {t('projects.no_projects_yet')}
                        </Text>
                        <Text className="text-secondary-500 dark:text-secondary-400 text-center leading-5 font-medium">
                            {t('dashboard.create_first_project_desc')}
                        </Text>
                    </View>
                }
            />
            
            <TouchableOpacity
                onPress={() => router.push('/(app)/projects/new')}
                activeOpacity={0.8}
                className="absolute bottom-8 right-6 w-16 h-16 rounded-full shadow-2xl shadow-primary-600/40 justify-center items-center z-50"
                style={{ backgroundColor: theme.primary600 }}
            >
                <PlusIcon size={30} color="#ffffff" />
            </TouchableOpacity>
        </View>
    );
}
