import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useCuentas, useTransacciones } from '../../../../src/hooks/graphql/useFinance';
import { useProjectStore } from '../../../../src/stores/projectStore';
import { useTranslate, useAppTheme } from '../../../../src/shared/hooks';
import { formatCurrency } from '../../../../src/shared/currency';
import { 
    WalletIcon, 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon, 
    ChevronLeftIcon,
    InformationCircleIcon,
    ClockIcon
} from '../../../../src/shared/icons';

/**
 * AccountDetailScreen - Detail view for a specific financial account.
 * Shows balance, meta-information, and full transaction history.
 */
export default function AccountDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { activeProject } = useProjectStore();
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    
    const proyectoId = activeProject?.id || '';
    
    // Fetch accounts and transactions
    const { data: cuentas, isLoading: loadingCuentas } = useCuentas(proyectoId);
    const { data: transactions, isLoading: loadingTransacciones } = useTransacciones(proyectoId);

    if (loadingCuentas || loadingTransacciones) {
        return (
            <View className="flex-1 items-center justify-center bg-secondary-50 dark:bg-secondary-950">
                <ActivityIndicator size="large" color={theme.primary600} />
            </View>
        );
    }

    const cuenta = cuentas?.find(c => c.id === id);

    if (!cuenta) {
        return (
            <View className="flex-1 items-center justify-center bg-secondary-50 dark:bg-secondary-950 p-6">
                <InformationCircleIcon size={48} color={isDark ? '#374151' : '#d1d5db'} />
                <Text className="text-secondary-900 dark:text-white text-lg font-black mt-4">
                    {t('finance.account_not_found', 'Cuenta no encontrada')}
                </Text>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="mt-6 px-6 py-3 bg-primary-600 rounded-xl"
                >
                    <Text className="text-white font-bold">{t('common.go_back', 'Volver')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Filter transactions for this specific account
    const allAccountTransactions = (transactions || [])
        .filter(t => t.cuenta?.id === id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Strategy: show only last 20 transactions in detail view
    const accountTransactions = allAccountTransactions.slice(0, 20);
    const hasTransactions = allAccountTransactions.length > 0;

    const statusColor = cuenta.estado === 'due' ? '#ef4444' : (cuenta.estado === 'warning' ? '#f59e0b' : '#10b981');
    const statusKey = (cuenta.estado === 'active' || cuenta.estado === 'activa') ? 'active_f' : 
                      (cuenta.estado === 'inactive' || cuenta.estado === 'inactiva') ? 'inactive_f' : 
                      cuenta.estado;

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <Stack.Screen 
                options={{
                    headerShown: true,
                    title: cuenta.nombre,
                    headerStyle: { backgroundColor: theme.primary600 },
                    headerTintColor: 'white',
                    headerLeft: () => (
                        <TouchableOpacity 
                            onPress={() => router.back()} 
                            className="mr-4 w-10 h-10 items-center justify-center rounded-full active:bg-white/10"
                            activeOpacity={0.6}
                        >
                            <ChevronLeftIcon size={24} color="white" />
                        </TouchableOpacity>
                    ),
                }} 
            />
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Summary Card */}
                <View 
                    className="rounded-3xl p-6 shadow-lg mb-6 border border-white/10"
                    style={{ backgroundColor: theme.primary600 }}
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center">
                            <WalletIcon size={24} color="white" />
                        </View>
                        <View className="bg-white/20 px-3 py-1.5 rounded-full self-start">
                            <Text className="text-white text-[10px] font-black tracking-wider">
                                {t(`finance.type_${cuenta.tipo}`, cuenta.tipo)}
                            </Text>
                        </View>
                    </View>
                    
                    <Text className="text-white/80 text-sm font-bold mb-1">
                        {t('finance.current_balance')}
                    </Text>
                    <Text className="text-4xl font-black text-white mb-2">
                        {formatCurrency(cuenta.saldo_actual ?? cuenta.saldo ?? 0, cuenta.moneda)}
                    </Text>
                    
                    {cuenta.banco && (
                        <Text className="text-white/90 font-medium text-base">
                            {cuenta.banco}
                        </Text>
                    )}
                </View>

                {/* Account Details */}
                <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 shadow-sm mb-8 border border-secondary-100 dark:border-secondary-800">
                    <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-[2px] mb-4">
                        {t('finance.account_info')}
                    </Text>
                    
                    <View className="gap-4">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-secondary-500 font-medium">{t('finance.initial_balance')}</Text>
                            <Text className="font-bold text-secondary-900 dark:text-white">{formatCurrency(cuenta.saldo_inicial || 0, cuenta.moneda)}</Text>
                        </View>

                        {cuenta.limite_credito > 0 && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-secondary-500 font-medium">{t('finance.credit_limit')}</Text>
                                <Text className="font-bold text-secondary-900 dark:text-white">{formatCurrency(cuenta.limite_credito, cuenta.moneda)}</Text>
                            </View>
                        )}

                        {cuenta.tasa_interes_anual > 0 && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-secondary-500 font-medium">{t('finance.interest_rate')}</Text>
                                <Text className="font-bold text-secondary-900 dark:text-white">{cuenta.tasa_interes_anual}%</Text>
                            </View>
                        )}

                        {cuenta.dia_corte > 0 && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-secondary-500 font-medium">{t('finance.cutoff_day')}</Text>
                                <Text className="font-bold text-secondary-900 dark:text-white">{cuenta.dia_corte}</Text>
                            </View>
                        )}

                        {cuenta.dia_pago > 0 && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-secondary-500 font-medium">{t('finance.payment_day')}</Text>
                                <Text className="font-bold text-secondary-900 dark:text-white">{cuenta.dia_pago}</Text>
                            </View>
                        )}

                        <View className="flex-row justify-between items-center">
                            <Text className="text-secondary-500 font-medium">{t('finance.currency')}</Text>
                            <Text className="font-bold text-secondary-900 dark:text-white">{cuenta.moneda}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-secondary-500 font-medium">{t('common.status')}</Text>
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: statusColor }} />
                                <Text className="font-black text-secondary-900 dark:text-white capitalize">
                                    {t(`common.${statusKey}`, cuenta.estado)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Transaction History */}
                <View>
                    <View className="flex-row items-center justify-between mb-4 ml-1">
                        <View className="flex-row items-center gap-2">
                            <ClockIcon size={18} color={theme.primary600} />
                            <Text className="text-lg font-black text-secondary-900 dark:text-white">
                                {t('finance.transaction_history')}
                            </Text>
                        </View>
                        {hasTransactions && (
                            <TouchableOpacity 
                                onPress={() => router.push({
                                    pathname: '/(app)/finance/transactions',
                                    params: { accountId: id }
                                })}
                                className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                            >
                                <Text className="text-xs font-bold text-primary-600 dark:text-primary-400">
                                    {t('common.view_all')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {accountTransactions.length === 0 ? (
                        <View className="bg-white dark:bg-secondary-900 rounded-3xl p-10 items-center justify-center border border-secondary-100 dark:border-secondary-800">
                            <Text className="text-secondary-400 dark:text-secondary-500 text-center italic">
                                {t('finance.no_transactions_account')}
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {accountTransactions.map((trans) => {
                                const isIncome = trans.monto > 0;
                                const amountColor = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
                                
                                return (
                                    <TouchableOpacity 
                                        key={trans.id}
                                        className="bg-white dark:bg-secondary-900 rounded-2xl p-4 flex-row items-center justify-between border border-secondary-100 dark:border-secondary-800 shadow-sm"
                                        onPress={() => {/* Navigate to transaction details if needed */}}
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                                                isIncome ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                                            }`}>
                                                {isIncome ? (
                                                    <ArrowTrendingUpIcon size={20} color="#10b981" />
                                                ) : (
                                                    <ArrowTrendingDownIcon size={20} color="#ef4444" />
                                                )}
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-secondary-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                                                    {trans.descripcion || trans.categoria?.nombre || t('finance.no_description')}
                                                </Text>
                                                <Text className="text-secondary-400 dark:text-secondary-500 text-[10px]">
                                                    {new Date(trans.fecha).toLocaleDateString()} • {trans.categoria?.nombre || t('finance.no_category')}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View className="items-end justify-center ml-2">
                                            <View className="flex-row items-center">
                                                <Text className={`font-black text-sm ${amountColor}`}>
                                                    {isIncome ? '+ ' : '- '}
                                                </Text>
                                                <Text className={`font-black text-sm ${amountColor}`}>
                                                    {formatCurrency(Math.abs(trans.monto), cuenta.moneda)}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
