import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { WidgetCard } from '../../../shared/components/WidgetCard';
import { FactoryIcon } from '../../../shared/icons';
import { useQuery } from '@apollo/client/react';
import { GET_LOTE_PRODUCCIONES } from '../../../services/graphql/queries';
import { ThemeColors } from '../../../shared/themes';

interface OperationsSummaryWidgetProps {
    proyectoId: number;
    compact?: boolean;
    theme?: ThemeColors;
}

export const OperationsSummaryWidget = ({ proyectoId, compact = false, theme: providedTheme }: OperationsSummaryWidgetProps) => {
    const { t } = useTranslate();
    const { theme: appTheme, isDark } = useAppTheme();
    const theme = providedTheme || appTheme;

    const { data, loading } = useQuery(GET_LOTE_PRODUCCIONES, {
        variables: { proyecto_id: proyectoId, first: 3, status: 'en_proceso' },
        skip: !proyectoId
    });

    const lotes = data?.loteProducciones?.data || [];

    if (loading && compact) {
        return <ActivityIndicator size="small" color={theme.primary500} />;
    }

    if (compact) {
        return (
            <View className="flex-row items-center px-1">
                <FactoryIcon size={14} color={theme.primary600} />
                <Text className="text-sm font-bold text-secondary-700 dark:text-secondary-300 ml-1.5">
                    {lotes.length} {t('operations.active_batches')}
                </Text>
            </View>
        );
    }

    return (
        <WidgetCard title={t('operations.active_batches', 'Lotes Activos')}>
            {loading ? (
                <View className="py-10 items-center">
                    <ActivityIndicator size="small" color={theme.primary500} />
                </View>
            ) : (
                <View className="gap-3">
                    {lotes.map((lote: any) => {
                        const progression = 0.5; // Default if no data
                        return (
                            <View key={lote.id} className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-4 border border-secondary-100 dark:border-secondary-700/50">
                                <View className="flex-row justify-between items-center mb-3">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <FactoryIcon size={16} color={theme.primary600} />
                                        <Text className="ml-2 text-base font-bold text-secondary-900 dark:text-secondary-100" numberOfLines={1}>{lote.code}</Text>
                                    </View>
                                    <View 
                                        className="px-2.5 py-0.5 rounded-full border border-primary-200 dark:border-primary-800 relative overflow-hidden"
                                        style={{ backgroundColor: theme.primary100 }}
                                    >
                                        <View className="absolute inset-0 bg-white opacity-40" pointerEvents="none" />
                                        <Text className="text-sm font-bold z-10" style={{ color: theme.primary700 }}>{lote.status}</Text>
                                    </View>
                                </View>
                                
                                <View className="h-1.5 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                                    <View 
                                        className="h-full rounded-full" 
                                        style={{ width: `${progression * 100}%`, backgroundColor: theme.primary500 }} 
                                    />
                                </View>
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400">{lote.stage?.name || 'Etapa'}</Text>
                                    <Text className="text-sm font-bold text-secondary-600 dark:text-secondary-300">{lote.current_quantity} {lote.unit || ''}</Text>
                                </View>
                            </View>
                        );
                    })}
                    
                    {lotes.length === 0 && (
                        <View className="py-4 items-center">
                            <Text className="text-sm text-secondary-400 italic">No hay lotes activos</Text>
                        </View>
                    )}
                    
                    <Pressable className="py-2 items-center active:opacity-70 mt-1">
                        <Text className="text-sm font-bold" style={{ color: theme.primary600 }}>
                            {t('common.view_all', 'Ver todos →')}
                        </Text>
                    </Pressable>
                </View>
            )}
        </WidgetCard>
    );
};
