import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../../shared/currency';
import { 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon,
    ClockIcon,
    ChevronRightIcon
} from '../../../shared/icons';
import { Transaccion } from '../../../hooks/graphql/useFinance';
import { useAppTheme } from '../../../shared/hooks';

interface TransactionsWidgetProps {
    transactions: Transaccion[];
    t: (key: string, defaultValue?: string) => string;
    theme: any;
    onViewAll?: () => void;
    onSelect?: (transaction: Transaccion) => void;
}

/**
 * TransactionsWidget - Mirroring AccountDetailScreen style but for global activity
 */
export const TransactionsWidget = ({ 
    transactions = [], 
    t, 
    theme,
    onViewAll,
    onSelect 
}: TransactionsWidgetProps) => {
    const { isDark } = useAppTheme();
    // Tomamos las últimas 5 transacciones globales
    const items = Array.isArray(transactions) 
        ? [...transactions]
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .slice(0, 5)
        : [];

    return (
        <View>
            <View className="flex-row items-center justify-between mb-4 px-1">
                <View className="flex-row items-center gap-2">
                    <ClockIcon size={18} color={theme.primary600} />
                    <Text className="text-lg font-black text-secondary-900 dark:text-white">
                        {t('finance.activity', 'Actividad Reciente')}
                    </Text>
                </View>
                {items.length > 0 && (
                    <TouchableOpacity 
                        onPress={onViewAll}
                        className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg active:opacity-70"
                    >
                        <Text className="text-xs font-bold" style={{ color: theme?.primary600 }}>
                            {t('common.view_all', 'Ver Todo')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {items.length === 0 ? (
                <View className="bg-white dark:bg-secondary-900 rounded-3xl p-10 items-center justify-center border border-secondary-100 dark:border-secondary-800 shadow-sm">
                    <Text className="text-secondary-400 dark:text-secondary-500 text-sm italic text-center">
                        {t('finance.no_transactions', 'No hay transacciones registradas')}
                    </Text>
                </View>
            ) : (
                <View className="gap-3">
                    {items.map((trans) => {
                        const isIncome = (trans.monto || 0) > 0;
                        const amountColor = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
                        
                        return (
                            <TouchableOpacity 
                                key={trans.id}
                                onPress={() => onSelect?.(trans)}
                                className="bg-white dark:bg-secondary-900 rounded-2xl p-4 flex-row items-center justify-between border border-secondary-100 dark:border-secondary-800 shadow-sm active:scale-[0.98] transition-all"
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
                                            {trans.descripcion || trans.categoria?.nombre || t('finance.expense')}
                                        </Text>
                                        <Text className="text-secondary-400 dark:text-secondary-500 text-[10px]" numberOfLines={1}>
                                            {trans.fecha} • {trans.categoria?.nombre || t('finance.no_category')}
                                            {trans.cuenta?.nombre ? ` • ${trans.cuenta.nombre}` : ''}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View className="items-end justify-center ml-2">
                                    <Text className={`font-black text-sm ${amountColor}`}>
                                        {formatCurrency(trans.monto || 0, trans.cuenta?.moneda)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
};
