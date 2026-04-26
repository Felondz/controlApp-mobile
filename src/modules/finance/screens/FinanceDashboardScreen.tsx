import React, { useState, useMemo, memo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '../../../stores/projectStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCuentas, useTransacciones } from '../../../hooks/graphql/useFinance';

// Components
import { FinanceControlBar } from '../components/FinanceControlBar';
import { AccountCard } from '../components/AccountCard';
import { TransactionModal } from '../components/TransactionModal';

// Isolated Widgets (Dumb Components)
import { BalanceSummaryWidget } from '../widgets/BalanceSummaryWidget';
import { UpcomingObligationsWidget } from '../widgets/UpcomingObligationsWidget';
import { AccountUsageChartWidget } from '../widgets/AccountUsageChartWidget';
import { TransactionsWidget } from '../widgets/TransactionsWidget';

// Shared Components
import Modal from '../../../shared/components/Modal';

const FinanceDashboardScreenComponent = () => {
    const { activeProject } = useProjectStore();
    const { visibleWidgets, toggleWidget } = useSettingsStore();
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();

    const [showInactive, setShowInactive] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showWidgetSettings, setShowWidgetSettings] = useState(false);
    const [transactionModal, setTransactionModal] = useState<{ visible: boolean; type: 'income' | 'expense' | 'invoice' }>({
        visible: false,
        type: 'expense'
    });

    // Centralized Data Fetching (TanStack Query)
    const proyectoId = activeProject?.id || 0;
    
    const { data: cuentas = [], isLoading: loadingCuentas, refetch: refetchCuentas } = useCuentas(proyectoId);
    const { data: transacciones = [], isLoading: loadingTransacciones } = useTransacciones(proyectoId);
    const { data: obligations = [], isLoading: loadingPending } = useTransacciones(proyectoId, { status: 'pending' });

    const filteredAccounts = useMemo(() => {
        if (showInactive) return cuentas;
        return cuentas.filter(c => c.estado !== 'inactivo');
    }, [cuentas, showInactive]);

    const totalBalance = useMemo(() => {
        return cuentas.reduce((acc, c) => acc + (c.saldo_actual || 0), 0);
    }, [cuentas]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetchCuentas();
        setRefreshing(false);
    };

    const handleAction = (type: 'income' | 'expense' | 'invoice' | 'new_account') => {
        if (type === 'new_account') {
            router.push('/(app)/finance/accounts/new');
        } else {
            setTransactionModal({ visible: true, type });
        }
    };

    if (!activeProject) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#030712' : '#f9fafb' }}>
                <ActivityIndicator size="large" color={theme.primary500} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary500} />
                }
            >
                <FinanceControlBar 
                    showInactive={showInactive}
                    onToggleInactive={setShowInactive}
                    onAction={handleAction}
                    onConfigureWidgets={() => setShowWidgetSettings(true)}
                />

                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4 px-1">
                        <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-[2px]">
                            {t('finance.your_accounts', 'Mis Cuentas')}
                        </Text>
                        <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black">
                            {filteredAccounts.length} {t('common.total', 'Total')}
                        </Text>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                        {loadingCuentas && cuentas.length === 0 ? (
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                {[1, 2].map(i => (
                                    <View key={i} style={{ width: 160, height: 120, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#f3f4f6' }} />
                                ))}
                            </View>
                        ) : filteredAccounts.length === 0 ? (
                            <View style={{ width: 300, padding: 20, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' }}>
                                <Text className="text-secondary-400 text-xs italic">{t('finance.no_accounts_to_show', 'No hay cuentas para mostrar')}</Text>
                            </View>
                        ) : (
                            filteredAccounts.map(cuenta => (
                                <AccountCard 
                                    key={cuenta.id} 
                                    cuenta={cuenta} 
                                    onPress={() => router.push(`/(app)/finance/accounts/${cuenta.id}`)}
                                />
                            ))
                        )}
                    </ScrollView>
                </View>

                <View className="gap-6">
                    {visibleWidgets.finance_balance && (
                        <BalanceSummaryWidget 
                            totalBalance={totalBalance}
                            accountCount={cuentas.length}
                            t={t}
                        />
                    )}

                    {visibleWidgets.finance_charts && (
                        <AccountUsageChartWidget 
                            cuentas={cuentas}
                            t={t}
                            theme={theme}
                            isDark={isDark}
                            isLoading={loadingCuentas}
                        />
                    )}

                    <UpcomingObligationsWidget 
                        obligations={obligations}
                        t={t}
                        theme={theme}
                    />
                    
                    <TransactionsWidget 
                        transactions={transacciones}
                        t={t}
                        theme={theme}
                        onViewAll={() => {}}
                    />
                </View>
            </ScrollView>

            <TransactionModal 
                visible={transactionModal.visible}
                onClose={() => setTransactionModal({ ...transactionModal, visible: false })}
                proyectoId={activeProject.id}
                type={transactionModal.type}
            />

            <Modal
                visible={showWidgetSettings}
                onClose={() => setShowWidgetSettings(false)}
                title={t('dashboard.manage_widgets')}
                headerBackgroundColor={theme.primary500}
                headerTextColor="white"
            >
                <View className="p-4 gap-3">
                    {[
                        { key: 'finance_balance', label: t('dashboard.widgets.finance_balance') },
                        { key: 'finance_charts', label: t('dashboard.widgets.finance_charts') },
                    ].map((widget) => (
                        <View key={widget.key} className="flex-row items-center justify-between p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800">
                            <Text className="font-bold text-secondary-900 dark:text-white">{widget.label}</Text>
                            <Switch 
                                value={visibleWidgets[widget.key]} 
                                onValueChange={() => toggleWidget(widget.key)}
                                trackColor={{ false: '#d1d5db', true: theme.primary500 }}
                            />
                        </View>
                    ))}
                </View>
            </Modal>
        </View>
    );
}

export const FinanceDashboardScreen = memo(FinanceDashboardScreenComponent);
export default FinanceDashboardScreen;
