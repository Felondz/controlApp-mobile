import React from 'react';
import TasksListScreen from "../../../src/modules/tasks/screens/TasksListScreen";
import { useProjectStore } from "../../../src/stores/projectStore";
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslate } from '../../../src/shared/hooks';

export default function TasksPage() {
    const { activeProject } = useProjectStore();
    const { t } = useTranslate();

    if (!activeProject) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <Stack.Screen options={{ title: t('tasks.title', 'Tareas'), headerLargeTitle: true }} />
                <Text className="text-secondary-500 text-center">
                    Debe seleccionar un proyecto para abrir las tareas
                </Text>
            </View>
        );
    }

    return <TasksListScreen proyectoId={activeProject.id} />;
}
