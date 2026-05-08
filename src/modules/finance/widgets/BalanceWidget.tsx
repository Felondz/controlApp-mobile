import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCuentas } from '../../../hooks/graphql/useFinance';
import { PlusIcon, MinusIcon, WalletIcon } from '../../../shared/icons';
import { formatCurrency } from '../../../shared/currency';

// Widgets
import PrimaryButton from '../../../shared/components/PrimaryButton';
import DangerButton from '../../../shared/components/DangerButton';

import { ThemeColors } from '../../../shared/themes';

interface BalanceWidgetProps {
    proyectoId: string;
    compact?: boolean;
    theme?: ThemeColors;
}

export const BalanceWidget = ({ proyectoId, compact = false, theme: providedTheme }: BalanceWidgetProps) => {
    const { t } = useTranslate();
    const { theme: appTheme, isDark } = useAppTheme();
    const theme = providedTheme || appTheme;
    
    const { data: cuentas, isLoading: loading } = useCuentas(proyectoId);

    const balance = useMemo(() => {
        if (!cuentas || !Array.isArray(cuentas)) return 0;
        return cuentas.reduce((acc, c) => {
            const val = c.saldo_actual ?? c.saldo ?? 0;
            // If it's a credit card, we usually subtract from global balance if it's debt
            // But here saldo might be positive or negative.
            // Convention: credit accounts subtract from balance if they have debt?
            // Actually let's follow FinanceDashboardScreen logic.
            return c.tipo === 'credito' || c.tipo === 'tarjeta' ? acc - val : acc + val;
        }, 0);
    }, [cuentas]);

    if (compact) {
        return (
            <View className="items-center py-2">
                {loading ? (
                    <ActivityIndicator size="small" color={theme.primary500} />
                ) : (
                    <View className="items-center">
                        <Text 
                            className="text-2xl font-black tracking-tighter"
                            style={{ color: (balance || 0) >= 0 ? (isDark ? theme.primary400 : theme.primary700) : '#ef4444' }}
                        >
                            {formatCurrency(balance || 0, 'COP')}
                        </Text>
                        <Text className="text-sm font-black text-secondary-400 mt-0.5">
                            {t('dashboard.global_balance', 'Saldo Global')}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View className="bg-white dark:bg-secondary-800 rounded-2xl p-5 border border-secondary-200 dark:border-secondary-700 shadow-sm">
            <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center">
                    <View 
                        className="w-9 h-9 rounded-xl items-center justify-center mr-3 relative overflow-hidden border"
                        style={{ backgroundColor: isDark ? theme.primary900 : theme.primary50, borderColor: isDark ? theme.primary800 : theme.primary100 }}
                    >
                        {/* Safe opacity overlay */}
                        <View className="absolute inset-0 bg-white dark:bg-black opacity-20" pointerEvents="none" />
                        <View className="z-10">
                            <WalletIcon size={18} color={theme.primary600} />
                        </View>
                    </View>
                    <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400">
                        {t('dashboard.global_balance', 'Saldo Global')}
                    </Text>
                </View>
            </View>

            <View className="items-center justify-center mb-6">
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary500} />
                ) : (
                    <Text 
                        className="text-3xl font-black tracking-tighter"
                        style={{ color: (balance || 0) >= 0 ? (isDark ? theme.primary400 : theme.primary700) : '#ef4444' }}
                    >
                        {formatCurrency(balance || 0, 'COP')}
                    </Text>
                )}
            </View>

            {/* Quick Actions */}
            <View className="flex-row gap-3">
                <PrimaryButton 
                    variant="filled" 
                    className="flex-1"
                    onPress={() => {/* Open Income Modal */}}
                >
                    <View className="flex-row items-center">
                        <PlusIcon size={16} color="white" />
                        <Text className="text-white font-bold ml-2 text-sm">{t('finance.income', 'Ingreso')}</Text>
                    </View>
                </PrimaryButton>
                
                <DangerButton 
                    variant="filled" 
                    className="flex-1"
                    onPress={() => {/* Open Expense Modal */}}
                >
                    <View className="flex-row items-center">
                        <MinusIcon size={16} color="white" />
                        <Text className="text-white font-bold ml-2 text-sm">{t('finance.expense', 'Gasto')}</Text>
                    </View>
                </DangerButton>
            </View>
        </View>
    );
};
