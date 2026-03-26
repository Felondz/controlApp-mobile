import { InventoryListScreen } from '../../../src/modules/inventory';
import { useProjectStore } from '../../../src/stores/projectStore';
import { View, ActivityIndicator } from 'react-native';

export default function InventoryIndex() {
    const { activeProject } = useProjectStore();

    if (!activeProject) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return <InventoryListScreen proyectoId={activeProject.id} />;
}
