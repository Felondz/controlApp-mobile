import React from 'react';
import { View, Text } from 'react-native';
import { useTranslate } from '../../../shared/hooks';
import { WidgetCard } from '../../../shared/components/WidgetCard';
import { PackageIcon, CurrencyDollarIcon, ExclamationTriangleIcon, CheckIcon } from '../../../shared/icons';
import { formatCurrency } from '../../../shared/currency';

interface InventorySummaryWidgetProps {
    proyectoId: number;
    compact?: boolean;
    stats?: {
        totalItems: number;
        totalValue: number;
        lowStockCount: number;
        activeItems: number;
    };
}

export const InventorySummaryWidget = ({ proyectoId, compact = false, stats: providedStats }: InventorySummaryWidgetProps) => {
    const { t } = useTranslate();

    // Mock stats for now - should come from API/Store
    const statsData = providedStats || {
        totalItems: 42,
        totalValue: 1250000,
        lowStockCount: 5,
        activeItems: 38
    };

    if (compact) {
        return (
            <View className="flex-row items-center justify-between px-1">
                <View className="flex-row items-center">
                    <PackageIcon size={14} color="#6366f1" />
                    <Text className="text-[10px] font-bold text-secondary-700 dark:text-secondary-300 ml-1.5">
                        {statsData.totalItems} {t('inventory.items', 'Items')}
                    </Text>
                </View>
                {statsData.lowStockCount > 0 && (
                    <View className="flex-row items-center bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/30">
                        <ExclamationTriangleIcon size={10} color="#ef4444" />
                        <Text className="text-[9px] font-black text-red-600 dark:text-red-400 ml-1">
                            {statsData.lowStockCount}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    const stats = [
        {
            label: t('inventory.total_items', 'Items'),
            value: statsData.totalItems,
            icon: PackageIcon,
            color: '#6366f1',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
            label: t('inventory.total_value', 'Valor'),
            value: formatCurrency(statsData.totalValue, 'COP'),
            icon: CurrencyDollarIcon,
            color: '#10b981',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: t('inventory.low_stock_count', 'Bajo Stock'),
            value: statsData.lowStockCount,
            icon: ExclamationTriangleIcon,
            color: statsData.lowStockCount > 0 ? '#ef4444' : '#6b7280',
            bgColor: statsData.lowStockCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-secondary-50 dark:bg-secondary-800',
        },
        {
            label: t('inventory.active_items', 'Activos'),
            value: statsData.activeItems,
            icon: CheckIcon,
            color: '#3b82f6',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
    ];

    return (
        <WidgetCard title={t('inventory.summary', 'Resumen de Inventario')}>
            <View className="flex-row flex-wrap gap-3">
                {stats.map((stat, index) => (
                    <View
                        key={index}
                        className={`flex-1 min-w-[45%] rounded-2xl p-4 border border-secondary-100 dark:border-secondary-700/50 ${stat.bgColor}`}
                    >
                        <View className="flex-row items-center mb-2">
                            <stat.icon size={16} color={stat.color} />
                            <Text className="text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest ml-2">
                                {stat.label}
                            </Text>
                        </View>
                        <Text className="text-base font-bold text-secondary-900 dark:text-secondary-100" numberOfLines={1}>
                            {stat.value}
                        </Text>
                    </View>
                ))}
            </View>
        </WidgetCard>
    );
};
