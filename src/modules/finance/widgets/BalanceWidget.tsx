import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { financeApi } from '../../../services/api';
import { PlusIcon, MinusIcon, WalletIcon } from '../../../shared/icons';
import { formatCurrency } from '../../../shared/currency';

// Widgets
import PrimaryButton from '../../../shared/components/PrimaryButton';
import DangerButton from '../../../shared/components/DangerButton';

interface BalanceWidgetProps {
    proyectoId: number;
    compact?: boolean;
}

export const BalanceWidget = ({ proyectoId, compact = false }: BalanceWidgetProps) => {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchBalance = async () => {
            if (!proyectoId) return;
            try {
                const response = await financeApi.getBalance(proyectoId);
                if (isMounted) {
                    setBalance((response.data.balance ?? 0) / 100);
                    setLoading(false);
                }
            } catch (error) {
                console.error(`Failed to fetch balance for project ${proyectoId}:`, error);
                if (isMounted) setLoading(false);
            }
        };

        fetchBalance();

        return () => { isMounted = false; };
    }, [proyectoId]);

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
                        <Text className="text-[8px] font-black text-secondary-400 uppercase tracking-widest mt-0.5">
                            {t('dashboard.global_balance', 'Saldo Global')}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View className="bg-white dark:bg-secondary-800 rounded-3xl p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm">
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                    <View 
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3 relative overflow-hidden border"
                        style={{ backgroundColor: isDark ? theme.primary900 : theme.primary50, borderColor: isDark ? theme.primary800 : theme.primary100 }}
                    >
                        {/* Safe opacity overlay */}
                        <View className="absolute inset-0 bg-white dark:bg-black opacity-20" pointerEvents="none" />
                        <View className="z-10">
                            <WalletIcon size={20} color={theme.primary600} />
                        </View>
                    </View>
                    <Text className="text-xs font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">
                        {t('dashboard.global_balance', 'Saldo Global')}
                    </Text>
                </View>
            </View>

            <View className="items-center justify-center mb-8">
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary500} />
                ) : (
                    <Text 
                        className="text-4xl font-black tracking-tighter"
                        style={{ color: (balance || 0) >= 0 ? (isDark ? theme.primary400 : theme.primary700) : '#ef4444' }}
                    >
                        {formatCurrency(balance || 0, 'COP')}
                    </Text>
                )}
            </View>

            {/* Quick Actions */}
            <View className="flex-row gap-4">
                <PrimaryButton 
                    variant="filled" 
                    className="flex-1 h-14 shadow-lg shadow-primary-600/20"
                    style={{ backgroundColor: theme.primary600 }}
                    onPress={() => {/* Open Income Modal */}}
                >
                    <PlusIcon size={20} color="white" />
                    <Text className="text-white font-black ml-2 text-xs uppercase tracking-widest">Ingreso</Text>
                </PrimaryButton>
                
                <DangerButton 
                    variant="filled" 
                    className="flex-1 h-14 shadow-lg shadow-danger-600/20"
                    onPress={() => {/* Open Expense Modal */}}
                >
                    <MinusIcon size={20} color="white" />
                    <Text className="text-white font-black ml-2 text-xs uppercase tracking-widest">Gasto</Text>
                </DangerButton>
            </View>
        </View>
    );
};
