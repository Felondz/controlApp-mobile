import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { formatCurrency } from '../../../shared/currency';
import { WalletIcon, CurrencyDollarIcon, CreditCardIcon } from '../../../shared/icons';
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
    const { theme, isDark } = useAppTheme();
    
    // Safety check for malformed account data
    if (!cuenta) return null;

    const getBalanceColor = () => {
        const tipo = (cuenta.tipo || '').toLowerCase();
        const saldo = cuenta.saldo_actual ?? cuenta.saldo ?? 0;
        const isLiability = ['credito', 'tarjeta', 'credit_card'].includes(tipo);

        if (isLiability) {
            // Para deudas, saldo > 0 significa que debes dinero
            return saldo > 0 ? '#ef4444' : '#10b981';
        } else {
            // Para ahorros, saldo > 0 es dinero a favor
            return saldo >= 0 ? '#10b981' : '#ef4444';
        }
    };

    const balanceColor = getBalanceColor();
    const statusColor = cuenta.estado === 'due' ? '#ef4444' : (cuenta.estado === 'warning' ? '#f59e0b' : '#10b981');

    const getIcon = () => {
        const tipo = (cuenta.tipo || '').toLowerCase();
        const iconColor = theme.primary600;
        if (tipo === 'banco' || tipo === 'ahorro') return <CurrencyDollarIcon size={18} color={iconColor} />;
        if (tipo === 'credito' || tipo === 'tarjeta' || tipo === 'credit_card') return <CreditCardIcon size={18} color={iconColor} />;
        return <WalletIcon size={18} color={iconColor} />;
    };

    return (
        <Pressable 
            onPress={onPress}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-4 border border-secondary-100 dark:border-secondary-800 shadow-sm mr-4 min-w-[180px]"
            style={{ width: 180 }}
        >
            {/* Fila 1: Icono + (Tipo + Nombre) */}
            <View className="flex-row items-center mb-4">
                <View 
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: isDark ? `${theme.primary900}33` : `${theme.primary100}88` }}
                >
                    {getIcon()}
                </View>
                <View className="flex-1">
                    <Text 
                        className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black mb-0.5"
                        numberOfLines={1}
                    >
                        {cuenta.banco || (cuenta.tipo ? t(`finance.type_${cuenta.tipo.toLowerCase()}`) : 'General')}
                    </Text>
                    <Text 
                        className="text-secondary-900 dark:text-white font-black text-xs"
                        numberOfLines={1}
                    >
                        {cuenta.nombre || 'Sin nombre'}
                    </Text>
                </View>
            </View>

            {/* Fila 2: Balance (Izquierda) + Indicador (Derecha) */}
            <View className="flex-row items-end justify-between">
                <View>
                    <Text 
                        className="text-secondary-400 dark:text-secondary-500 text-[8px] font-black uppercase tracking-tighter mb-0.5"
                    >
                        {t('finance.balance', 'Balance')}
                    </Text>
                    <Text 
                        className="font-black text-base"
                        style={{ color: balanceColor }}
                    >
                        {formatCurrency(cuenta.saldo_actual ?? cuenta.saldo ?? 0)}
                    </Text>
                </View>
                
                <View className="flex-row items-center bg-secondary-50 dark:bg-secondary-800 px-2 py-1 rounded-full mb-1">
                    <View 
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: statusColor }}
                    />
                    <Text className="text-secondary-500 dark:text-secondary-400 text-[8px] font-black">
                        {['active', 'activa'].includes(cuenta.estado?.toLowerCase()) || !cuenta.estado 
                            ? t('common.active', 'Activa') 
                            : t('common.inactive', 'Inactiva')}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};
