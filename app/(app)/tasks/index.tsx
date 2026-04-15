import React from 'react';
import TasksListScreen from "../../../src/modules/tasks/screens/TasksListScreen";
import { useProjectStore } from "../../../src/stores/projectStore";
import { View, Text } from 'react-native';

export default function TasksPage() {
    const { activeProject } = useProjectStore();

    if (!activeProject) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <Text className="text-secondary-500 text-center">
                    Debe seleccionar un proyecto para abrir las tareas
                </Text>
            </View>
        );
    }

    return <TasksListScreen proyectoId={activeProject.id} />;
}
