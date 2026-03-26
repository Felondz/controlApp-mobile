import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { WidgetCard } from '../../../shared/components/WidgetCard';
import { FactoryIcon } from '../../../shared/icons';

interface OperationsSummaryWidgetProps {
    proyectoId: number;
    compact?: boolean;
}

export const OperationsSummaryWidget = ({ proyectoId, compact = false }: OperationsSummaryWidgetProps) => {
    const { t } = useTranslate();
    const { theme } = useAppTheme();

    // Mock data for operations
    const lotes = [
        { id: 1, nombre: 'Lote #104 - Café', estado: 'En proceso', progreso: 0.65 },
        { id: 2, nombre: 'Lote #105 - Cacao', estado: 'Iniciado', progreso: 0.15 },
    ];

    if (compact) {
        return (
            <View className="flex-row items-center px-1">
                <FactoryIcon size={14} color={theme.primary600} />
                <Text className="text-[10px] font-bold text-secondary-700 dark:text-secondary-300 ml-1.5">
                    {lotes.length} {t('operations.active_batches', 'Lotes Activos')}
                </Text>
            </View>
        );
    }

    return (
        <WidgetCard title={t('operations.active_batches', 'Lotes Activos')}>
            <View className="gap-4">
                {lotes.map((lote) => (
                    <View key={lote.id} className="bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl p-4 border border-secondary-100 dark:border-secondary-700/50">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <FactoryIcon size={18} color={theme.primary600} />
                                <Text className="ml-2 font-bold text-secondary-900 dark:text-secondary-100">{lote.nombre}</Text>
                            </View>
                            <View 
                                className="px-2 py-1 rounded-lg bg-primary-100 dark:bg-primary-900 border border-primary-200 dark:border-primary-800 relative overflow-hidden"
                                style={{ backgroundColor: theme.primary100 }}
                            >
                                {/* Safe opacity overlay */}
                                <View className="absolute inset-0 bg-white opacity-40" pointerEvents="none" />
                                <Text className="text-[10px] font-bold uppercase z-10" style={{ color: theme.primary700 }}>{lote.estado}</Text>
                            </View>
                        </View>
                        
                        {/* Progress Bar */}
                        <View className="h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                            <View 
                                className="h-full" 
                                style={{ width: `${lote.progreso * 100}%`, backgroundColor: theme.primary500 }} 
                            />
                        </View>
                        <View className="flex-row justify-between mt-2">
                            <Text className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Progreso</Text>
                            <Text className="text-[10px] font-bold text-secondary-600 dark:text-secondary-300">{Math.round(lote.progreso * 100)}%</Text>
                        </View>
                    </View>
                ))}
                
                <Pressable className="py-2 items-center active:opacity-70">
                    <Text className="text-sm font-bold" style={{ color: theme.primary600 }}>
                        {t('common.view_all', 'Ver todos →')}
                    </Text>
                </Pressable>
            </View>
        </WidgetCard>
    );
};
