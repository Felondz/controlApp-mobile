import { View, Text, ActivityIndicator } from 'react-native';
import { useProjectStore } from '../../../src/stores/projectStore';
import { useTranslate } from '../../../src/shared/hooks';

export default function OperationsIndex() {
    const { activeProject } = useProjectStore();
    const { t } = useTranslate();

    if (!activeProject) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center items-center bg-secondary-50 dark:bg-secondary-950 p-6">
            <Text className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                {t('operations.title', 'Operaciones')}
            </Text>
            <Text className="text-secondary-500 dark:text-secondary-400 text-center">
                El módulo de operaciones para el proyecto "{activeProject.nombre}" está siendo optimizado para móvil.
            </Text>
        </View>
    );
}
