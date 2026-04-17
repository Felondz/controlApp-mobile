import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { useDashboardStore, Project } from '../../../stores/dashboardStore';
import { useTranslate } from '../../../shared/hooks';
import { ProjectCard } from '../../projects/components/ProjectCard';

export const DraggableProjectList = () => {
    // Select state atom
    const projects = useDashboardStore(state => state.projects);
    const saveProjectOrder = useDashboardStore(state => state.saveProjectOrder);
    // Needed for updating local state during drag
    const setProjects = useCallback((newProjects: Project[]) => {
        useDashboardStore.setState({ projects: newProjects });
    }, []);

    const { t } = useTranslate();

    const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Project>) => {
        return (
            <ScaleDecorator>
                <View className="mb-4 px-4">
                    <ProjectCard
                        project={item}
                        dragHandleProps={{ onLongPress: drag }}
                    />
                </View>
            </ScaleDecorator>
        );
    }, []);

    if (!projects || projects.length === 0) {
        return (
            <View className="p-8 items-center justify-center">
                <Text className="text-gray-500 text-center text-lg">
                    {t('dashboard.no_projects')}
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                    {t('projects.create_new_hint')}
                </Text>
            </View>
        );
    }

    return (
        <DraggableFlatList
            data={projects}
            onDragEnd={({ data }) => {
                setProjects(data);
                saveProjectOrder();
            }}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
            ListFooterComponent={() => (
                <View className="px-4 mb-4">
                    <View className="bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 items-center justify-center">
                        <Text className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                            {t('dashboard.create_project')}
                        </Text>
                        <Text className="text-gray-400 dark:text-gray-500 text-sm text-center">
                            {t('dashboard.create_first_project_desc')}
                        </Text>
                    </View>
                </View>
            )}
        />
    );
};
