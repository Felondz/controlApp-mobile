import React, { useState, useMemo, memo } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, Switch, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useProjectStore } from '../../../stores/projectStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCuentas, useTransacciones } from '../../../hooks/graphql/useFinance';

// Components
import { FinanceControlBar } from '../components/FinanceControlBar';
import { AccountCard } from '../components/AccountCard';
import { TransactionModal } from '../components/TransactionModal';
import { AccountModal } from '../components/AccountModal';
import { PlusIcon } from '../../../shared/icons';

// Isolated Widgets (Dumb Components)
import { BalanceSummaryWidget } from '../widgets/BalanceSummaryWidget';
import { UpcomingObligationsWidget } from '../widgets/UpcomingObligationsWidget';
import { AccountUsageChartWidget } from '../widgets/AccountUsageChartWidget';
import { TransactionsWidget } from '../widgets/TransactionsWidget';

// Shared Components
import Modal from '../../../shared/components/Modal';
import { ThemedScrollView } from '../../../shared/components';

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
    const [accountModalVisible, setAccountModalVisible] = useState(false);

    // Centralized Data Fetching (TanStack Query)
    const proyectoId = activeProject?.id || '';
    const { data: cuentasData = [], isLoading: loadingCuentas, refetch: refetchCuentas } = useCuentas(proyectoId);
    const cuentas = Array.isArray(cuentasData) ? cuentasData : [];

    const { data: transacciones = [], isLoading: loadingTransacciones } = useTransacciones(proyectoId);
    const { data: obligations = [], isLoading: loadingPending } = useTransacciones(proyectoId, { status: 'pending' });

    // Auto-refresh when screen gains focus
    useFocusEffect(
        React.useCallback(() => {
            if (proyectoId) {
                refetchCuentas();
            }
            return () => {};
        }, [proyectoId])
    );

    const filteredAccounts = useMemo(() => {
        if (!cuentas || !Array.isArray(cuentas)) return [];
        if (showInactive) return cuentas;
        return cuentas.filter(c => c.estado !== 'inactivo');
    }, [cuentas, showInactive]);

    const totalBalance = useMemo(() => {
        if (!cuentas || !Array.isArray(cuentas)) return 0;
        return cuentas.reduce((acc, c) => {
            const balance = c.saldo_actual ?? c.saldo ?? 0;
            // Subtract for credit, add for others
            return c.tipo === 'credito' ? acc - balance : acc + balance;
        }, 0);
    }, [cuentas]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetchCuentas();
        setRefreshing(false);
    };

    const handleAction = (type: 'income' | 'expense' | 'invoice' | 'new_account') => {
        if (type === 'new_account') {
            setAccountModalVisible(true);
        } else {
            // Requisito: No se puede realizar transacciones sin una cuenta
            if (!cuentas || cuentas.length === 0) {
                Alert.alert(
                    t('finance.no_accounts_title', 'Requiere una Cuenta'),
                    t('finance.no_accounts_message', 'Debes crear al menos una cuenta para poder registrar ingresos o gastos.'),
                    [
                        { text: t('common.cancel'), style: 'cancel' },
                        { 
                            text: t('finance.create_account', 'Crear Cuenta'), 
                            onPress: () => router.push('/(app)/finance/accounts/new') 
                        }
                    ]
                );
                return;
            }
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
            <ThemedScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
                        <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-bold">
                            {t('finance.your_accounts', 'Mis Cuentas')}
                        </Text>
                        <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-bold">
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
                            <TouchableOpacity 
                                onPress={() => router.push('/(app)/finance/accounts/new')}
                                className="bg-white dark:bg-secondary-900 rounded-xl p-8 border border-dashed border-secondary-300 dark:border-secondary-700 items-center justify-center min-w-[300px]"
                            >
                                <PlusIcon size={24} color={theme.primary600} />
                                <Text className="text-secondary-500 dark:text-secondary-400 mt-2 font-bold text-center">
                                    {t('finance.add_first_account', 'Agregar mi primera cuenta')}
                                </Text>
                            </TouchableOpacity>
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
            </ThemedScrollView>

            <TransactionModal 
                visible={transactionModal.visible}
                onClose={() => setTransactionModal({ ...transactionModal, visible: false })}
                proyectoId={activeProject.id}
                type={transactionModal.type}
            />

            <AccountModal 
                visible={accountModalVisible}
                onClose={() => setAccountModalVisible(false)}
                proyectoId={activeProject.id}
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
