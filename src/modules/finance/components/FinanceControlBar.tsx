import React from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { 
    PlusIcon, 
    CurrencyDollarIcon, 
    BoltIcon, 
    Cog6ToothIcon,
    WalletIcon
} from '../../../shared/icons';

interface FinanceControlBarProps {
    showInactive: boolean;
    onToggleInactive: (value: boolean) => void;
    onAction: (type: 'income' | 'expense' | 'invoice' | 'new_account') => void;
    onConfigureWidgets: () => void;
}

export const FinanceControlBar = ({ 
    showInactive, 
    onToggleInactive, 
    onAction, 
    onConfigureWidgets 
}: FinanceControlBarProps) => {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();

    const ActionButton = ({ 
        label, 
        icon: Icon, 
        colorClass, 
        iconColor, 
        onPress 
    }: { 
        label: string, 
        icon: any, 
        colorClass: string, 
        iconColor: string, 
        onPress: () => void 
    }) => (
        <Pressable 
            onPress={onPress}
            className={`flex-1 items-center justify-center p-3 rounded-xl border ${colorClass} active:opacity-70`}
        >
            <View className="mb-1">
                <Icon size={20} color={iconColor} />
            </View>
            <Text className="text-[10px] font-black uppercase tracking-tighter" style={{ color: iconColor }}>
                {label}
            </Text>
        </Pressable>
    );

    return (
        <View className="bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-100 dark:border-secondary-800 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <Switch
                        value={showInactive}
                        onValueChange={onToggleInactive}
                        trackColor={{ false: isDark ? '#374151' : '#e5e7eb', true: theme.primary500 }}
                        thumbColor="#ffffff"
                        ios_backgroundColor={isDark ? '#374151' : '#e5e7eb'}
                    />
                    <Text className="ml-2 text-xs font-bold text-secondary-500 dark:text-secondary-400">
                        {t('finance.show_inactive', 'Cuentas Inactivas')}
                    </Text>
                </View>
                
                <Pressable 
                    onPress={onConfigureWidgets}
                    className="w-8 h-8 items-center justify-center rounded-lg bg-secondary-50 dark:bg-secondary-800 active:scale-95"
                >
                    <Cog6ToothIcon size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                </Pressable>
            </View>

            <View className="flex-row gap-2">
                <ActionButton 
                    label={t('finance.income', 'Ingreso')} 
                    icon={PlusIcon} 
                    colorClass="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30" 
                    iconColor="#10b981" 
                    onPress={() => onAction('income')} 
                />
                <ActionButton 
                    label={t('finance.expense', 'Gasto')} 
                    icon={CurrencyDollarIcon} 
                    colorClass="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30" 
                    iconColor="#ef4444" 
                    onPress={() => onAction('expense')} 
                />
                <ActionButton 
                    label={t('finance.invoice', 'Factura')} 
                    icon={BoltIcon} 
                    colorClass="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30" 
                    iconColor="#3b82f6" 
                    onPress={() => onAction('invoice')} 
                />
                <ActionButton 
                    label={t('finance.new_account_short', 'Cuenta')} 
                    icon={WalletIcon} 
                    colorClass="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30" 
                    iconColor="#6366f1" 
                    onPress={() => onAction('new_account')} 
                />
            </View>
        </View>
    );
};
