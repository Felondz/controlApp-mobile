import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLoteProducciones, LoteProduccion } from '../../operations/useOperations';
import { 
    FactoryIcon, 
    PlusIcon, 
    ClockIcon,
    ChevronRightIcon 
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import { useSettingsStore } from '../../../stores/settingsStore';
import { SkeletonList } from '../../../shared/components/Skeleton';
import { useTranslate } from '../../../shared/hooks/useTranslate';

interface LotesListScreenProps {
    proyectoId: string;
    onAdd?: () => void;
    onPress?: (lote: LoteProduccion) => void;
}

export default function LotesListScreen({ proyectoId, onAdd, onPress }: LotesListScreenProps) {
    const { t } = useTranslate();
    const { isDark } = useSettingsStore();

    const [refreshing, setRefreshing] = useState(false);

    const { data, loading, error, refetch } = useLoteProducciones(proyectoId, undefined, 20);

    const lotes = data?.loteProducciones?.data || [];
    const paginator = data?.loteProducciones?.paginatorInfo;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const getStatusBadge = (status: string) => {
        const isActive = status === 'active';
        return isActive
            ? isDark 
                ? 'bg-green-900/30 text-green-300' 
                : 'bg-green-100 text-green-800'
            : isDark 
                ? 'bg-gray-700 text-gray-300' 
                : 'bg-gray-100 text-gray-800';
    };

    const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Header */}
            <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b`}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <FactoryIcon size={20} color={isDark ? '#818cf8' : '#6366f1'} />
                        <Text className={`text-lg font-bold ${textColor} ml-2`}>
                            {t('operations.title', 'Operaciones')}
                        </Text>
                    </View>
                    {onAdd && (
                        <TouchableOpacity
                            onPress={onAdd}
                            className="bg-primary-600 px-3 py-1.5 rounded-lg flex-row items-center"
                        >
                            <PlusIcon size={16} color="white" />
                            <Text className="text-white text-sm font-medium ml-1">
                                {t('operations.new_lote', 'Nuevo')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <View className="p-4">
                        <SkeletonList count={5} />
                    </View>
                ) : lotes.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 px-4">
                        <View className={`w-16 h-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} items-center justify-center mb-4`}>
                            <FactoryIcon size={32} color={isDark ? '#6b7280' : '#9ca3af'} />
                        </View>
                        <Text className={`text-lg font-medium ${textColor} mb-1`}>
                            {t('operations.no_active_lotes', 'No hay lotes activos')}
                        </Text>
                        <Text className={`text-sm ${textSecondary} mb-4 text-center`}>
                            {t('operations.create_first_lote', 'Crea tu primer lote de producción')}
                        </Text>
                        {onAdd && (
                            <PrimaryButton onPress={onAdd}>
                                <PlusIcon size={16} color="white" />
                                <Text className="text-white ml-2">{t('operations.new_lote', 'Nuevo')}</Text>
                            </PrimaryButton>
                        )}
                    </View>
                ) : (
                    <View className="p-4 gap-3">
                        {lotes.map((lote) => (
                            <TouchableOpacity
                                key={lote.id}
                                onPress={() => onPress?.(lote)}
                                className={`${cardBg} ${borderColor} border rounded-xl overflow-hidden`}
                            >
                                <View className="p-4">
                                    {/* Header */}
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1">
                                            <View className="flex-row items-center">
                                                <Text className={`text-[10px] ${textSecondary}`}>
                                                    <FactoryIcon size={12} color={textSecondary} /> {lote.productionProcess?.name || t('operations.process_general', 'Proceso')}
                                                </Text>
                                            </View>
                                            <Text className={`text-base font-bold ${textColor} mt-1`}>
                                                {lote.code}
                                            </Text>
                                        </View>
                                        <View className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${getStatusBadge(lote.status)}`}>
                                            {lote.status}
                                        </View>
                                    </View>

                                    {/* Details */}
                                    <View className="space-y-2">
                                        <View className="flex-row justify-between items-center">
                                            <Text className={`text-xs ${textSecondary}`}>
                                                {t('operations.current_stage', 'Etapa actual')}:
                                            </Text>
                                            <View className={`px-2 py-0.5 rounded border text-[10px] font-medium ${borderColor} ${isDark ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                                                {lote.stage?.name || 'Inicio'}
                                            </View>
                                        </View>

                                        <View className="flex-row justify-between items-center">
                                            <Text className={`text-xs ${textSecondary}`}>
                                                {t('operations.quantity', 'Cantidad')}:
                                            </Text>
                                            <Text className={`text-sm font-mono font-medium ${textColor}`}>
                                                {lote.current_quantity} {t('operations.units', 'unidades')}
                                            </Text>
                                        </View>

                                        <View className="flex-row justify-between items-center">
                                            <Text className={`text-xs flex-row items-center ${textSecondary}`}>
                                                <ClockIcon size={12} color={textSecondary} /> {t('operations.start_date', 'Fecha inicio')}:
                                            </Text>
                                            <Text className={`text-xs ${textColor}`}>
                                                {new Date(lote.start_date).toLocaleDateString()}
                                            </Text>
                                        </View>

                                        {/* Progress Bar */}
                                        {lote.productionProcess?.etapas && (
                                            <View className="mt-3">
                                                <View className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                    <View
                                                        className="h-full bg-primary-600 rounded-full transition-all duration-500"
                                                        style={{ 
                                                            width: `${((lote.stage?.order || 1) / (lote.productionProcess.etapas.length || 1)) * 100}%` 
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Footer */}
                                <TouchableOpacity 
                                    className={`flex-row items-center justify-center py-2 border-t ${borderColor}`}
                                    onPress={() => onPress?.(lote)}
                                >
                                    <Text className={`text-xs font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                                        {t('common.view_details', 'Ver detalles')}
                                    </Text>
                                    <ChevronRightIcon size={14} color={isDark ? '#818cf8' : '#6366f1'} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
