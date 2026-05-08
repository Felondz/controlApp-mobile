import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CalculatorIcon } from '../../../shared/icons';
import { Cuenta } from '../../../hooks/graphql/useFinance';
import { formatCurrency } from '../../../shared/currency';

interface AccountUsageChartWidgetProps {
    cuentas: Cuenta[];
    t: (key: string, defaultValue?: string) => string;
    theme: any;
    isDark: boolean;
    isLoading?: boolean;
}

/**
 * AccountUsageChartWidget - Pie Chart for Funds Distribution
 */
export const AccountUsageChartWidget = ({ 
    cuentas = [], 
    t, 
    theme, 
    isDark,
    isLoading = false 
}: AccountUsageChartWidgetProps) => {
    
    if (isLoading) {
        return (
            <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm items-center justify-center min-h-[220px]">
                <ActivityIndicator color={theme?.primary500 || '#6366f1'} />
                <Text className="text-secondary-400 dark:text-secondary-500 text-xs font-black mt-3 uppercase tracking-widest">
                    {t('finance.charts_loading', 'Generando reporte...')}
                </Text>
            </View>
        );
    }

    const items = Array.isArray(cuentas) ? cuentas : [];
    const filteredItems = items.filter(c => (c.saldo_actual ?? c.saldo ?? 0) > 0);

    if (filteredItems.length === 0) {
        return (
            <View className="bg-white dark:bg-secondary-900 rounded-3xl p-8 border border-secondary-100 dark:border-secondary-800 shadow-sm items-center justify-center min-h-[180px]">
                <View className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-full mb-4">
                    <CalculatorIcon size={32} color={isDark ? '#4b5563' : '#9ca3af'} />
                </View>
                <Text className="text-secondary-500 dark:text-secondary-400 font-black text-center">
                    {t('finance.no_balance_data', 'Sin fondos disponibles para graficar')}
                </Text>
            </View>
        );
    }

    // Vibrant colors palette for pie chart
    const colors = [
        theme?.primary500 || '#6366f1',
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#f43f5e', // Rose
        '#8b5cf6', // Violet
        '#06b6d4', // Cyan
        '#f97316', // Orange
        '#ec4899', // Pink
        '#14b8a6', // Teal
        '#3b82f6', // Blue
        '#a855f7', // Purple
        '#84cc16', // Lime
    ];

    const totalSaldo = filteredItems.reduce((acc, c) => acc + (c.saldo_actual ?? c.saldo ?? 0), 0);

    // Transform data for PieChart
    const pieData = filteredItems
        .sort((a, b) => (b.saldo_actual ?? b.saldo ?? 0) - (a.saldo_actual ?? a.saldo ?? 0))
        .map((cuenta, index) => {
            const saldo = cuenta.saldo_actual ?? cuenta.saldo ?? 0;
            const percentage = Math.round((saldo / totalSaldo) * 100);
            
            return {
                value: saldo,
                color: colors[index % colors.length],
                text: `${percentage}%`,
                label: cuenta.nombre,
                focused: index === 0,
            };
        });

    return (
        <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm">
            <View className="flex-row items-center justify-between mb-8">
                <View>
                    <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black tracking-[2px] mb-1">
                        {t('finance.accounts_usage', 'Análisis de Fondos')}
                    </Text>
                    <Text className="text-xl font-black text-secondary-900 dark:text-white">
                        {t('finance.accounts_distribution', 'Distribución')}
                    </Text>
                </View>
                <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: isDark ? `${theme?.primary900}33` : `${theme?.primary100}88` }}
                >
                    <CalculatorIcon size={20} color={theme?.primary600 || '#6366f1'} />
                </View>
            </View>

            <View className="flex-row items-center justify-between">
                {/* Donut Chart */}
                <View className="items-center justify-center" style={{ width: '45%' }}>
                    <PieChart
                        data={pieData}
                        donut
                        sectionAutoFocus
                        radius={65}
                        innerRadius={45}
                        innerCircleColor={isDark ? '#111827' : '#ffffff'}
                    />
                </View>

                {/* Legend */}
                <View style={{ width: '50%' }}>
                    {pieData.slice(0, 4).map((item, index) => (
                        <View key={index} className="flex-row items-center mb-3">
                            <View 
                                className="w-2.5 h-2.5 rounded-full mr-2"
                                style={{ backgroundColor: item.color }}
                            />
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between">
                                    <Text 
                                        className="text-secondary-900 dark:text-white text-[10px] font-black flex-1 mr-1"
                                        numberOfLines={1}
                                    >
                                        {item.label}
                                    </Text>
                                    <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black">
                                        {item.text}
                                    </Text>
                                </View>
                                <Text className="text-secondary-400 dark:text-secondary-500 text-[9px] font-medium">
                                    {formatCurrency(item.value)}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {pieData.length > 4 && (
                        <Text className="text-secondary-400 dark:text-secondary-500 text-[9px] font-black italic mt-1">
                            + {pieData.length - 4} {t('common.more', 'más...')}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
};
