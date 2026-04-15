import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, useWindowDimensions, Pressable } from 'react-native';
import { FlashList } from "@shopify/flash-list";
// import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useLoteProducciones, LoteProduccion } from '../../operations/useOperations';
import { 
    FactoryIcon, 
    PlusIcon, 
    ClockIcon,
    ChevronRightIcon,
    LayersIcon
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import { SkeletonList } from '../../../shared/components/Skeleton';
import { useTranslate, useAppTheme } from '../../../shared/hooks';

interface LotesListScreenProps {
    proyectoId: string;
    onAdd?: () => void;
    onPress?: (lote: LoteProduccion) => void;
}

export default function LotesListScreen({ proyectoId, onAdd, onPress }: LotesListScreenProps) {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    const router = useRouter();

    const [refreshing, setRefreshing] = useState(false);
    const isTablet = width >= 768;

    const { data, loading, refetch } = useLoteProducciones(proyectoId, undefined, 20);

    const lotes = data?.loteProducciones?.data || [];

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleAdd = () => {
        if (onAdd) onAdd();
        else router.push('/(app)/operations/new');
    };

    const handlePress = (lote: LoteProduccion) => {
        if (onPress) onPress(lote);
        else router.push(`/(app)/operations/${lote.id}`);
    };

    const getStatusBadge = (status: string) => {
        const isActive = status === 'active';
        return isActive
            ? isDark 
                ? 'bg-green-900/30 text-green-300' 
                : 'bg-green-100 text-green-800'
            : isDark 
                ? 'bg-secondary-800 text-secondary-400' 
                : 'bg-secondary-100 text-secondary-600';
    };

    const renderItem = ({ item: lote }: { item: LoteProduccion }) => {
        const progress = lote.productionProcess?.etapas 
            ? ((lote.stage?.order || 1) / (lote.productionProcess.etapas.length || 1)) * 100
            : 0;

        return (
            <View className={`p-2 ${isTablet ? 'w-1/2' : 'w-full'}`}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handlePress(lote)}
                    className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-[32px] overflow-hidden shadow-sm h-full"
                >
                    <View className="p-5">
                        <View className="flex-row items-start justify-between mb-4">
                            <View className="flex-1 mr-2">
                                <View className="flex-row items-center mb-1">
                                    <FactoryIcon size={12} color={isDark ? '#4b5563' : '#9ca3af'} />
                                    <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest ml-1.5" numberOfLines={1}>
                                        {lote.productionProcess?.name || t('operations.process_general', 'Proceso')}
                                    </Text>
                                </View>
                                <Text className="text-secondary-900 dark:text-secondary-50 font-black text-lg leading-tight">
                                    {lote.code}
                                </Text>
                            </View>
                            <View className={`px-2.5 py-1 rounded-full ${getStatusBadge(lote.status)}`}>
                                <Text className="text-[10px] font-black uppercase tracking-wider">
                                    {lote.status}
                                </Text>
                            </View>
                        </View>

                        <View className="gap-4">
                            <View className="flex-row justify-between items-center bg-secondary-50 dark:bg-secondary-800/50 px-4 py-3 rounded-2xl border border-secondary-100 dark:border-secondary-800/50">
                                <View className="flex-row items-center">
                                    <LayersIcon size={14} color={theme.primary600} />
                                    <Text className="text-xs font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-wider ml-2">
                                        {t('operations.current_stage', 'Etapa')}:
                                    </Text>
                                </View>
                                <Text className="text-sm font-black text-secondary-900 dark:text-secondary-100">
                                    {lote.stage?.name || 'Inicio'}
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <View>
                                    <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-[2px] mb-1">
                                        {t('operations.quantity', 'Cantidad')}
                                    </Text>
                                    <Text className="text-xl font-black text-secondary-900 dark:text-secondary-50">
                                        {lote.current_quantity} <Text className="text-xs font-bold text-secondary-400 uppercase">{t('operations.units', 'unidades')}</Text>
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-[2px] mb-1">
                                        {t('operations.start_date', 'Inicio')}
                                    </Text>
                                    <View className="flex-row items-center">
                                        <ClockIcon size={14} color={isDark ? '#4b5563' : '#9ca3af'} />
                                        <Text className="text-sm font-black text-secondary-900 dark:text-secondary-50 ml-1.5">
                                            {new Date(lote.start_date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View>
                                <View className="flex-row justify-between items-end mb-2">
                                    <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">
                                        {t('operations.progress', 'Progreso de Producción')}
                                    </Text>
                                    <Text className="text-xs font-black text-primary-600 dark:text-primary-400">
                                        {Math.round(progress)}%
                                    </Text>
                                </View>
                                <View className="h-2 rounded-full overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                                    <View
                                        className="h-full rounded-full"
                                        style={{ 
                                            width: `${progress}%`,
                                            backgroundColor: theme.primary600
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        className="flex-row items-center justify-center py-4 border-t border-secondary-100 dark:border-secondary-800/50 bg-secondary-50/30 dark:bg-secondary-800/30 active:bg-secondary-100 dark:active:bg-secondary-800"
                        onPress={() => handlePress(lote)}
                    >
                        <Text className="text-xs font-black uppercase tracking-widest mr-2" style={{ color: theme.primary600 }}>
                            {t('common.view_details', 'Ver detalles')}
                        </Text>
                        <ChevronRightIcon size={16} color={theme.primary600} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            {/* Header */}
            <View className="px-5 pt-4 pb-6 bg-white dark:bg-secondary-950 border-b border-secondary-100 dark:border-secondary-900">
                <View className="flex-row items-center justify-between px-1">
                    <View>
                        <Text className="text-3xl font-black tracking-tighter text-secondary-900 dark:text-secondary-50">
                            {t('operations.title', 'Operaciones')}
                        </Text>
                        <Text className="text-secondary-400 dark:text-secondary-500 text-xs font-bold uppercase tracking-widest mt-1">
                            {t('operations.production_batches', 'Lotes de Producción')}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleAdd}
                        className="w-11 h-11 rounded-2xl items-center justify-center border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900"
                    >
                        <PlusIcon size={24} color={theme.primary600} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1">
                {loading && !refreshing ? (
                    <View className="p-5">
                        <SkeletonList count={5} />
                    </View>
                ) : lotes.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 px-8">
                        <View className="w-24 h-24 rounded-[32px] bg-secondary-100 dark:bg-secondary-900 items-center justify-center mb-6">
                            <FactoryIcon size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
                        </View>
                        <Text className="text-xl font-black text-secondary-900 dark:text-secondary-50 mb-2 text-center">
                            {t('operations.no_active_lotes', 'No hay lotes activos')}
                        </Text>
                        <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 text-center mb-8 leading-relaxed">
                            {t('operations.create_first_lote', 'Crea tu primer lote de producción para comenzar a monitorear tus procesos.')}
                        </Text>
                        <PrimaryButton 
                            onPress={handleAdd}
                            className="px-8 h-14 rounded-2xl"
                        >
                            <PlusIcon size={20} color="white" />
                            <Text className="text-white font-black uppercase tracking-widest ml-3">
                                {t('operations.new_lote', 'Nuevo Lote')}
                            </Text>
                        </PrimaryButton>
                    </View>
                ) : (
                    <FlashList
                        data={lotes}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        // @ts-ignore
                            estimatedItemSize={250}
                        numColumns={isTablet ? 2 : 1}
                        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={onRefresh}
                                tintColor={theme.primary600}
                                colors={[theme.primary600]}
                            />
                        }
                    />
                )}
            </View>

            {lotes.length > 0 && (
                <Pressable
                    onPress={handleAdd}
                    className="absolute bottom-10 right-8 w-16 h-16 rounded-[24px] shadow-2xl items-center justify-center z-50 active:scale-90 transition-all"
                    style={{ 
                        backgroundColor: theme.primary600,
                        shadowColor: theme.primary600,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 10
                    }}
                >
                    <PlusIcon size={32} color="white" />
                </Pressable>
            )}
        </View>
    );
}
