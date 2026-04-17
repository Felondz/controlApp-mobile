import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { WidgetCard } from '../../../shared/components/WidgetCard';
import { PackageIcon, CurrencyDollarIcon, ExclamationTriangleIcon, CheckIcon } from '../../../shared/icons';
import { formatCurrency } from '../../../shared/currency';
import { useQuery } from '@apollo/client/react';
import { GET_INVENTORY_ITEMS } from '../../../services/graphql/queries';
import { ThemeColors } from '../../../shared/themes';

interface InventorySummaryWidgetProps {
    proyectoId: number;
    compact?: boolean;
    theme?: ThemeColors;
}

export const InventorySummaryWidget = ({ proyectoId, compact = false, theme: providedTheme }: InventorySummaryWidgetProps) => {
    const { t } = useTranslate();
    const { theme: appTheme } = useAppTheme();
    const theme = providedTheme || appTheme;

    const { data, loading } = useQuery(GET_INVENTORY_ITEMS, {
        variables: { proyecto_id: proyectoId, first: 1000 },
        skip: !proyectoId
    });

    const items = data?.inventoryItems?.data || [];
    const totalItems = items.length;
    const totalValue = items.reduce((acc: number, item: any) => acc + (item.current_stock * (item.cost_price || 0)), 0);
    const lowStockCount = items.filter((item: any) => item.current_stock <= (item.min_stock_level || 0)).length;
    const activeItems = items.filter((item: any) => item.is_active).length;

    if (loading && compact) {
        return <ActivityIndicator size="small" color={theme.primary500} />;
    }

    if (compact) {
        return (
            <View className="flex-row items-center justify-between px-1">
                <View className="flex-row items-center">
                    <PackageIcon size={14} color={theme.primary600} />
                    <Text className="text-sm font-bold text-secondary-700 dark:text-secondary-300 ml-1.5">
                        {totalItems} {t('inventory.items')}
                    </Text>
                </View>
                {lowStockCount > 0 && (
                    <View className="flex-row items-center bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-900/30">
                        <ExclamationTriangleIcon size={10} color="#ef4444" />
                        <Text className="text-sm font-bold text-red-600 dark:text-red-400 ml-1">
                            {lowStockCount}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    const stats = [
        {
            label: t('inventory.total_items', 'Items'),
            value: totalItems,
            icon: PackageIcon,
            color: '#6366f1',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
            label: t('inventory.total_value', 'Valor'),
            value: formatCurrency(totalValue, 'COP'),
            icon: CurrencyDollarIcon,
            color: '#10b981',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: t('inventory.low_stock_count', 'Bajo Stock'),
            value: lowStockCount,
            icon: ExclamationTriangleIcon,
            color: lowStockCount > 0 ? '#ef4444' : '#6b7280',
            bgColor: lowStockCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-secondary-50 dark:bg-secondary-800',
        },
        {
            label: t('inventory.active_items', 'Activos'),
            value: activeItems,
            icon: CheckIcon,
            color: '#3b82f6',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
    ];

    return (
        <WidgetCard title={t('inventory.summary', 'Resumen de Inventario')}>
            {loading ? (
                <View className="py-10 items-center">
                    <ActivityIndicator size="small" color={theme.primary500} />
                </View>
            ) : (
                <View className="flex-row flex-wrap gap-2.5">
                    {stats.map((stat, index) => (
                        <View
                            key={index}
                            className={`flex-1 min-w-[45%] rounded-xl p-4 border border-secondary-100 dark:border-secondary-700/50 ${stat.bgColor}`}
                        >
                            <View className="flex-row items-center mb-2">
                                <stat.icon size={16} color={stat.color} />
                                <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 ml-2">
                                    {stat.label}
                                </Text>
                            </View>
                            <Text className="text-base font-bold text-secondary-900 dark:text-secondary-100" numberOfLines={1}>
                                {stat.value}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </WidgetCard>
    );
};
