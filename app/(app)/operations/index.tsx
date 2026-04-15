import { View, ActivityIndicator } from 'react-native';
import { useProjectStore } from '../../../src/stores/projectStore';
import { LotesListScreen } from '../../../src/modules/operations';
import { useAppTheme } from '../../../src/shared/hooks';

export default function OperationsIndex() {
    const { activeProject } = useProjectStore();
    const { theme } = useAppTheme();

    if (!activeProject) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary-50 dark:bg-secondary-950">
                <ActivityIndicator size="large" color={theme.primary600} />
            </View>
        );
    }

    return <LotesListScreen proyectoId={activeProject.id.toString()} />;
}
