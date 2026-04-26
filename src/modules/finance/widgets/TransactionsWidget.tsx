import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../../shared/currency';
import { 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon,
} from '../../../shared/icons';
import { Transaccion } from '../../../hooks/graphql/useFinance';

interface TransactionsWidgetProps {
    transactions: Transaccion[];
    t: (key: string, defaultValue?: string) => string;
    theme: any;
    onViewAll?: () => void;
    onSelect?: (transaction: Transaccion) => void;
}

/**
 * TransactionsWidget - Pure Data-Safe Component
 */
export const TransactionsWidget = ({ 
    transactions = [], 
    t, 
    theme,
    onViewAll,
    onSelect 
}: TransactionsWidgetProps) => {
    const items = Array.isArray(transactions) 
        ? [...transactions].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5)
        : [];

    return (
        <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm">
            <View className="flex-row items-center justify-between mb-6">
                <View>
                    <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-[2px] mb-1">
                        {t('finance.activity', 'Actividad Reciente')}
                    </Text>
                    <Text className="text-xl font-black text-secondary-900 dark:text-white">
                        {t('finance.transactions', 'Transacciones')}
                    </Text>
                </View>
                <TouchableOpacity 
                    onPress={onViewAll}
                    className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 active:opacity-70"
                >
                    <Text className="text-xs font-bold" style={{ color: theme?.primary600 }}>
                        {t('common.view_all', 'Ver Todo')}
                    </Text>
                </TouchableOpacity>
            </View>

            {items.length === 0 ? (
                <View className="py-8 items-center justify-center">
                    <Text className="text-secondary-400 dark:text-secondary-500 text-sm italic">
                        {t('finance.no_transactions', 'No hay transacciones registradas')}
                    </Text>
                </View>
            ) : (
                <View className="gap-4">
                    {items.map((trans) => {
                        const isIncome = (trans.monto || 0) > 0;
                        return (
                            <TouchableOpacity 
                                key={trans.id}
                                onPress={() => onSelect?.(trans)}
                                className="flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                                        isIncome ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                                    }`}>
                                        {isIncome ? (
                                            <ArrowTrendingUpIcon size={20} color="#10b981" />
                                        ) : (
                                            <ArrowTrendingDownIcon size={20} color="#ef4444" />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-secondary-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                                            {trans.titulo || trans.categoria?.nombre || t('finance.expense')}
                                        </Text>
                                        <Text className="text-secondary-400 dark:text-secondary-500 text-[10px]">
                                            {trans.fecha} {trans.cuenta?.nombre ? `• ${trans.cuenta.nombre}` : ''}
                                        </Text>
                                    </View>
                                </View>
                                <Text className={`font-black text-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isIncome ? '+' : '-'}{formatCurrency(Math.abs(trans.monto || 0))}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
};
