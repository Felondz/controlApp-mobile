import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { CalculatorIcon } from '../../../shared/icons';
import { Cuenta } from '../../../hooks/graphql/useFinance';

interface AccountUsageChartWidgetProps {
    cuentas: Cuenta[];
    t: (key: string, defaultValue?: string) => string;
    theme: any;
    isDark: boolean;
    isLoading?: boolean;
}

/**
 * AccountUsageChartWidget - Pure UI Component
 * Robust against empty data and isolated from global hooks.
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
            <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm items-center justify-center min-h-[180px]">
                <ActivityIndicator color={theme?.primary500 || '#6366f1'} />
                <Text className="text-secondary-400 dark:text-secondary-500 text-xs font-bold mt-3">
                    {t('finance.charts_loading', 'Generando reporte...')}
                </Text>
            </View>
        );
    }

    const items = Array.isArray(cuentas) ? cuentas : [];

    if (items.length === 0) {
        return (
            <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm items-center justify-center min-h-[150px]">
                <CalculatorIcon size={32} color={isDark ? '#374151' : '#e5e7eb'} />
                <Text className="text-secondary-500 dark:text-secondary-400 mt-2 font-medium">
                    {t('finance.no_accounts', 'No hay cuentas registradas')}
                </Text>
            </View>
        );
    }

    // Transform data for the BarChart safely
    const chartData = items.map((cuenta) => ({
        value: Math.max(0, cuenta.saldo_actual || 0),
        label: (cuenta.nombre || '').length > 6 ? cuenta.nombre.substring(0, 6) + '..' : (cuenta.nombre || 'N/A'),
        frontColor: cuenta.color || theme?.primary500 || '#6366f1',
        labelTextStyle: { 
            color: isDark ? '#9ca3af' : '#6b7280', 
            fontSize: 10,
            fontWeight: '700'
        },
    }));

    // If no values to show, display empty state
    if (chartData.length === 0 || chartData.every(d => d.value === 0)) {
        return (
            <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm items-center justify-center min-h-[150px]">
                <Text className="text-secondary-400 dark:text-secondary-500 text-sm">
                    {t('finance.no_balance_data', 'Sin datos de saldo para graficar')}
                </Text>
            </View>
        );
    }

    return (
        <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm">
            <View className="flex-row items-center justify-between mb-8">
                <View>
                    <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-[2px] mb-1">
                        {t('finance.accounts_usage', 'Distribución')}
                    </Text>
                    <Text className="text-xl font-black text-secondary-900 dark:text-white">
                        {t('finance.accounts_distribution', 'Distribución de Fondos')}
                    </Text>
                </View>
                <View 
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${theme?.primary500 || '#6366f1'}15` }}
                >
                    <CalculatorIcon size={20} color={theme?.primary600 || '#6366f1'} />
                </View>
            </View>

            <View className="items-center justify-center">
                <BarChart
                    data={chartData}
                    barWidth={35}
                    spacing={25}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: isDark ? '#4b5563' : '#9ca3af', fontSize: 10 }}
                    noOfSections={3}
                    maxValue={Math.max(...chartData.map(d => d.value)) * 1.2}
                    isAnimated
                    animationDuration={1000}
                    hideYAxisText
                    barBorderRadius={4}
                />
            </View>
        </View>
    );
};
