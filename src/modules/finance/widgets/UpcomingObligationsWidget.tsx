import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '../../../shared/currency';
import { BoltIcon } from '../../../shared/icons';
import { Transaccion } from '../../../hooks/graphql/useFinance';

interface UpcomingObligationsWidgetProps {
    obligations: Transaccion[];
    t: (key: string, defaultValue?: string) => string;
    theme: any;
}

/**
 * UpcomingObligationsWidget - Pure Data-Safe Component
 */
export const UpcomingObligationsWidget = ({ 
    obligations = [], 
    t, 
    theme 
}: UpcomingObligationsWidgetProps) => {
    const items = Array.isArray(obligations) ? obligations : [];

    return (
        <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm">
            <View className="mb-4">
                <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-[2px] mb-1">
                    {t('finance.obligations', 'Próximos Vencimientos')}
                </Text>
                <Text className="text-xl font-black text-secondary-900 dark:text-white">
                    {t('finance.accounts_distribution', 'Obligaciones')}
                </Text>
            </View>

            {items.length === 0 ? (
                <View className="py-4 items-center justify-center">
                    <Text className="text-secondary-400 dark:text-secondary-500 text-sm italic">
                        {t('finance.no_upcoming', 'No hay pagos pendientes próximamente')}
                    </Text>
                </View>
            ) : (
                <View className="gap-3">
                    {items.slice(0, 3).map((item) => (
                        <View 
                            key={item.id}
                            className="flex-row items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
                                    <BoltIcon size={16} color={theme?.primary600 || '#6366f1'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-secondary-900 dark:text-white font-bold text-xs" numberOfLines={1}>
                                        {item.titulo || item.categoria?.nombre || t('finance.expense')}
                                    </Text>
                                    <Text className="text-secondary-400 dark:text-secondary-500 text-[10px]">
                                        {item.fecha}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-red-500 dark:text-red-400 font-black text-sm ml-2">
                                {formatCurrency(item.monto || 0)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};
