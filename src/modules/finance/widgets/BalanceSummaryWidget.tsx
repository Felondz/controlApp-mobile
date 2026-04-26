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
    return (
        <View className="bg-primary-600 rounded-xl p-6 border border-primary-500 shadow-lg shadow-primary-600/30">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-primary-100 text-[10px] font-black uppercase tracking-[2px]">
                    {t('finance.global_balance', 'Balance General')}
                </Text>
                <View className="w-8 h-8 rounded-lg bg-primary-500/30 items-center justify-center">
                    <WalletIcon size={18} color="white" />
                </View>
            </View>
            
            <Text className="text-white font-black text-3xl mb-1">
                {formatCurrency(totalBalance || 0)}
            </Text>
            
            <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                <Text className="text-primary-100 text-xs font-bold">
                    {accountCount || 0} {t('finance.active_accounts', 'Cuentas activas')}
                </Text>
            </View>
        </View>
    );
};
