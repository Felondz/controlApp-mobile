import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '../../../shared/currency';
import { WalletIcon } from '../../../shared/icons';

interface BalanceSummaryWidgetProps {
    totalBalance: number;
    accountCount: number;
    t: (key: string, defaultValue?: string) => string;
}

/**
 * BalanceSummaryWidget - Pure UI component for balance summary.
 * Robust against zero or null data.
 */
export const BalanceSummaryWidget = ({ 
    totalBalance = 0, 
    accountCount = 0, 
    t 
}: BalanceSummaryWidgetProps) => {
    const isPositive = totalBalance >= 0;
    const bgColor = isPositive ? 'bg-emerald-600' : 'bg-red-600';
    const borderColor = isPositive ? 'border-emerald-500' : 'border-red-500';
    const shadowColor = isPositive ? 'shadow-emerald-600/30' : 'shadow-red-600/30';
    const indicatorColor = isPositive ? 'bg-emerald-400' : 'bg-red-400';

    return (
        <View className={`${bgColor} rounded-xl p-6 border ${borderColor} shadow-lg ${shadowColor}`}>
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white/70 text-[10px] font-black tracking-[2px] uppercase">
                    {t('finance.global_balance', 'Balance General')}
                </Text>
                <View className="w-8 h-8 rounded-lg bg-white/20 items-center justify-center">
                    <WalletIcon size={18} color="white" />
                </View>
            </View>
            
            <Text className="text-white font-black text-3xl mb-1">
                {formatCurrency(totalBalance || 0)}
            </Text>
            
            <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full ${indicatorColor} mr-2`} />
                <Text className="text-white/80 text-xs font-bold">
                    {accountCount || 0} {t('finance.active_accounts', 'Cuentas activas')}
                </Text>
            </View>
        </View>
    );
};
