import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { formatCurrency } from '../../../shared/currency';
import { WalletIcon, BanknotesIcon, CreditCardIcon } from '../../../shared/icons';
import { Cuenta } from '../../../hooks/graphql/useFinance';

interface AccountCardProps {
    cuenta: Cuenta;
    onPress?: () => void;
}

/**
 * AccountCard - Data-Safe UI Component
 */
export const AccountCard = ({ cuenta, onPress }: AccountCardProps) => {
    const { t } = useTranslate();
    const { isDark } = useAppTheme();
    
    // Safety check for malformed account data
    if (!cuenta) return null;

    const getStatusColor = () => {
        if (cuenta.estado === 'due') return '#ef4444'; // Red
        if (cuenta.estado === 'warning') return '#f59e0b'; // Amber
        return '#10b981'; // Green
    };

    const statusColor = getStatusColor();

    const getIcon = () => {
        const tipo = (cuenta.tipo || '').toLowerCase();
        if (tipo === 'banco') return <BanknotesIcon size={18} color="white" />;
        if (tipo === 'credit_card' || tipo === 'tarjeta') return <CreditCardIcon size={18} color="white" />;
        return <WalletIcon size={18} color="white" />;
    };

    return (
        <Pressable 
            onPress={onPress}
            className="bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-100 dark:border-secondary-800 shadow-sm mr-4 min-w-[160px]"
            style={{ width: 160 }}
        >
            <View className="flex-row items-start justify-between mb-3">
                <View 
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: cuenta.color || '#6366f1' }}
                >
                    {getIcon()}
                </View>
                <View 
                    className="w-3 h-3 rounded-full border-2 border-white dark:border-secondary-900"
                    style={{ backgroundColor: statusColor }}
                />
            </View>

            <View>
                <Text 
                    className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-wider mb-0.5"
                    numberOfLines={1}
                >
                    {cuenta.banco || cuenta.tipo || 'General'}
                </Text>
                <Text 
                    className="text-secondary-900 dark:text-white font-black text-sm mb-2"
                    numberOfLines={1}
                >
                    {cuenta.nombre || 'Sin nombre'}
                </Text>
                <Text 
                    className="font-black text-lg"
                    style={{ color: statusColor }}
                >
                    {formatCurrency(cuenta.saldo_actual || 0)}
                </Text>
            </View>
        </Pressable>
    );
};
