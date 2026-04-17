import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { 
    useTransacciones, 
    useCuentas, 
    useCategorias,
    useDeleteTransaccion,
    Transaccion 
} from '../../finance/useFinance';
import { 
    PlusIcon, 
    FunnelIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    PencilIcon,
    TrashIcon,
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import Modal from '../../../shared/components/Modal';
import { useSettingsStore } from '../../../stores/settingsStore';
import { SkeletonList } from '../../../shared/components/Skeleton';
import { useTranslate } from '../../../shared/hooks/useTranslate';
import { formatCurrency } from '../../../shared/currency';

interface TransactionsListScreenProps {
    proyectoId: number;
    onAdd?: () => void;
    onEdit?: (transaction: Transaccion) => void;
}

export default function TransactionsListScreen({ proyectoId, onAdd, onEdit }: TransactionsListScreenProps) {
    const { t } = useTranslate();
    const { isDark } = useSettingsStore();

    const [selectedAccount, setSelectedAccount] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModalTransaction, setDeleteModalTransaction] = useState<Transaccion | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

    const { data: transactionsData, loading: loadingTransactions, refetch: refetchTransactions } = useTransacciones(proyectoId);
    const { data: accountsData } = useCuentas(proyectoId);
    const { data: categoriesData } = useCategorias(proyectoId);

    const [deleteTransaccion, { loading: deleting }] = useDeleteTransaccion();

    const transactions = transactionsData?.transacciones || [];
    const accounts = accountsData?.cuentas || [];

    const filteredTransactions = useMemo(() => {
        return transactions.filter((trans: Transaccion) => {
            if (activeTab === 'income' && trans.monto <= 0) return false;
            if (activeTab === 'expense' && trans.monto > 0) return false;
            if (selectedAccount !== 'all' && trans.cuenta_id !== parseInt(selectedAccount)) return false;
            if (selectedCategory !== 'all' && trans.categoria_id !== parseInt(selectedCategory)) return false;
            return true;
        }).sort((a: Transaccion, b: Transaccion) => {
            const dateComparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            if (dateComparison !== 0) return dateComparison;
            return Number(b.id) - Number(a.id);
        });
    }, [transactions, selectedAccount, selectedCategory, activeTab]);

    const groupedTransactions = useMemo(() => {
        const groupsMap: Record<string, { date: Date; label: string; transactions: Transaccion[] }> = {};
        
        filteredTransactions.forEach((trans: Transaccion) => {
            const dateObj = new Date(trans.fecha);
            const dateKey = dateObj.toISOString().split('T')[0];
            
            if (!groupsMap[dateKey]) {
                groupsMap[dateKey] = {
                    date: dateObj,
                    label: dateObj.toLocaleDateString(),
                    transactions: []
                };
            }
            groupsMap[dateKey].transactions.push(trans);
        });
        
        return Object.values(groupsMap).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [filteredTransactions]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetchTransactions();
        setRefreshing(false);
    }, [refetchTransactions]);

    const handleDelete = async () => {
        if (!deleteModalTransaction) return;
        try {
            await deleteTransaccion({ 
                variables: { 
                    id: deleteModalTransaction.id, 
                    proyecto_id: proyectoId 
                }
            });
            setDeleteModalTransaction(null);
        } catch (err) {
            console.error('Error deleting transaction:', err);
        }
    };

    const getGroupLabel = (dateStr: string) => {
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
        if (dateStr === today) return t('common.today', 'Hoy');
        if (dateStr === yesterday) return t('common.yesterday', 'Ayer');
        return dateStr;
    };

    return (
        <View className={`flex-1 bg-secondary-50 dark:bg-secondary-900`}>
            {/* Header & Tabs */}
            <View className={`px-4 py-4 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 shadow-sm z-10`}>
                <View className="flex-row items-center justify-between mb-4">
                    <Text className={`text-xl font-bold text-secondary-900 dark:text-secondary-100`}>
                        {t('finance.transactions', 'Transacciones')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        activeOpacity={0.7}
                        className={`p-2.5 rounded-xl ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'bg-secondary-100 dark:bg-secondary-700'}`}
                    >
                        <FunnelIcon size={20} color={showFilters ? '#6366f1' : (isDark ? '#9ca3af' : '#6b7280')} />
                    </TouchableOpacity>
                </View>

                {/* Native-like Segmented Control */}
                <View className={`flex-row bg-secondary-100 dark:bg-secondary-700/50 rounded-xl p-1.5`}>
                    {(['all', 'income', 'expense'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-lg items-center justify-center transition-all ${
                                activeTab === tab
                                    ? 'bg-white dark:bg-secondary-600 shadow-sm'
                                    : ''
                            }`}
                        >
                            <Text className={`text-base font-bold ${
                                activeTab === tab
                                    ? 'text-secondary-900 dark:text-secondary-100'
                                    : 'text-secondary-500 dark:text-secondary-400'
                            }`}>
                                {tab === 'all' ? t('common.view_all', 'Todos') 
                                    : tab === 'income' ? t('finance.income', 'Ingresos')
                                    : t('finance.expense', 'Gastos')
                                }
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Filters Panel */}
                {showFilters && (
                    <View className={`mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700/50`}>
                        <Text className={`text-sm font-bold mb-3 text-secondary-500 dark:text-secondary-400`}>
                            {t('finance.filter_by_account', 'Filtrar por Cuenta')}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-2 pb-1">
                                <TouchableOpacity
                                    onPress={() => setSelectedAccount('all')}
                                    className={`px-4 py-2 rounded-xl border ${
                                        selectedAccount === 'all'
                                            ? 'bg-primary-600 border-primary-600'
                                            : 'bg-white dark:bg-secondary-700 border-secondary-200 dark:border-secondary-700'
                                    }`}
                                >
                                    <Text className={`text-sm font-bold ${selectedAccount === 'all' ? 'text-white' : 'text-secondary-600 dark:text-secondary-300'}`}>
                                        {t('finance.all_accounts', 'Todas')}
                                    </Text>
                                </TouchableOpacity>
                                {accounts.map((account) => (
                                    <TouchableOpacity
                                        key={account.id}
                                        onPress={() => setSelectedAccount(String(account.id))}
                                        className={`px-4 py-2 rounded-xl border ${
                                            selectedAccount === String(account.id)
                                                ? 'bg-primary-600 border-primary-600'
                                                : 'bg-white dark:bg-secondary-700 border-secondary-200 dark:border-secondary-700'
                                        }`}
                                    >
                                        <Text className={`text-sm font-bold ${selectedAccount === String(account.id) ? 'text-white' : 'text-secondary-600 dark:text-secondary-300'}`}>
                                            {account.nombre}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* List Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                }
            >
                {loadingTransactions ? (
                    <View className="p-4">
                        <SkeletonList count={6} />
                    </View>
                ) : groupedTransactions.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-24 px-8">
                        <View className={`w-24 h-24 rounded-full bg-secondary-200 dark:bg-secondary-800 items-center justify-center mb-6`}>
                            <FunnelIcon size={40} color={isDark ? '#4b5563' : '#9ca3af'} />
                        </View>
                        <Text className={`text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2 text-center`}>
                            {t('finance.no_transactions', 'Sin transacciones')}
                        </Text>
                        <Text className={`text-base text-secondary-500 dark:text-secondary-400 mb-8 text-center`}>
                            {t('finance.start_adding', 'No encontramos transacciones con los filtros actuales.')}
                        </Text>
                        {onAdd && (
                            <PrimaryButton onPress={onAdd} variant="filled" size="lg" className="px-8">
                                <PlusIcon size={20} color="white" />
                                <Text className="text-white ml-2 font-bold">{t('finance.add_transaction', 'Agregar Nueva')}</Text>
                            </PrimaryButton>
                        )}
                    </View>
                ) : (
                    <View className="p-4">
                        {groupedTransactions.map((group) => (
                            <View key={group.label} className="mb-6">
                                <View className="flex-row items-center mb-3 pl-1">
                                    <View className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
                                    <Text className={`text-sm font-bold text-secondary-500 dark:text-secondary-400`}>
                                        {getGroupLabel(group.label)}
                                    </Text>
                                </View>
                                
                                <View className="gap-3">
                                    {group.transactions.map((trans) => {
                                        const isIncome = trans.monto > 0;
                                        return (
                                            <TouchableOpacity
                                                key={trans.id}
                                                activeOpacity={0.7}
                                                onPress={() => onEdit?.(trans)}
                                                className={`bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 shadow-sm overflow-hidden`}
                                            >
                                                <View className="flex-row items-center p-4">
                                                    {/* Status Icon */}
                                                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                                                        isIncome
                                                            ? 'bg-green-50 dark:bg-green-900/20'
                                                            : 'bg-red-50 dark:bg-red-900/20'
                                                    }`}>
                                                        {isIncome ? (
                                                            <ArrowTrendingUpIcon 
                                                                size={24} 
                                                                color={isDark ? '#4ade80' : '#16a34a'} 
                                                            />
                                                        ) : (
                                                            <ArrowTrendingDownIcon 
                                                                size={24} 
                                                                color={isDark ? '#f87171' : '#dc2626'} 
                                                            />
                                                        )}
                                                    </View>

                                                    {/* Details */}
                                                    <View className="flex-1">
                                                        <Text className={`text-base font-bold text-secondary-900 dark:text-secondary-100 mb-1`} numberOfLines={1}>
                                                            {trans.titulo || t('finance.no_description', 'Sin descripción')}
                                                        </Text>
                                                        <View className="flex-row items-center">
                                                            <Text className={`text-sm font-medium px-2 py-0.5 rounded-md bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400`}>
                                                                {trans.categoria?.nombre || t('finance.no_category', 'Otros')}
                                                            </Text>
                                                            {trans.cuenta?.nombre && (
                                                                <Text className={`text-sm font-medium text-secondary-400 dark:text-secondary-500 ml-2`} numberOfLines={1}>
                                                                    • {trans.cuenta.nombre}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>

                                                    {/* Amount */}
                                                    <View className="items-end ml-2">
                                                        <Text className={`text-base font-black ${
                                                            isIncome
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {isIncome ? '+' : '-'}{formatCurrency(trans.monto, trans.cuenta?.moneda || 'COP')}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Inline Actions */}
                                                <View className={`flex-row border-t border-secondary-100 dark:border-secondary-700/50 bg-secondary-50/50 dark:bg-secondary-800/50 px-4 py-2.5 justify-end gap-6`}>
                                                    <TouchableOpacity
                                                        onPress={() => onEdit?.(trans)}
                                                        className={`flex-row items-center`}
                                                    >
                                                        <PencilIcon size={16} color={isDark ? '#818cf8' : '#6366f1'} />
                                                        <Text className={`text-sm font-bold ml-1.5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                                                            {t('common.edit', 'Editar')}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => setDeleteModalTransaction(trans)}
                                                        className="flex-row items-center"
                                                    >
                                                        <TrashIcon size={16} color="#ef4444" />
                                                        <Text className="text-sm font-bold ml-1.5 text-red-500">
                                                            {t('common.delete', 'Eliminar')}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            {onAdd && (
                <View className="absolute bottom-8 right-6">
                    <TouchableOpacity
                        onPress={onAdd}
                        activeOpacity={0.8}
                        className="w-16 h-16 bg-primary-600 rounded-full items-center justify-center shadow-lg shadow-primary-600/40"
                    >
                        <PlusIcon size={30} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={!!deleteModalTransaction}
                onClose={() => setDeleteModalTransaction(null)}
                size="sm"
            >
                <View className={`p-6 bg-white dark:bg-secondary-800 rounded-2xl`}>
                    <View className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-5 self-center">
                        <TrashIcon size={28} color="#ef4444" />
                    </View>
                    <Text className={`text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2 text-center`}>
                        {t('common.confirm_delete', '¿Eliminar Transacción?')}
                    </Text>
                    <Text className={`text-base text-secondary-500 dark:text-secondary-400 mb-6 text-center`}>
                        {t('transactions.confirm_delete_msg', 'Esta acción no se puede deshacer y afectará el saldo de tu cuenta.')}
                    </Text>
                    <View className="flex-row justify-center gap-3">
                        <SecondaryButton 
                            onPress={() => setDeleteModalTransaction(null)}
                            className="flex-1"
                        >
                            {t('common.cancel', 'Volver')}
                        </SecondaryButton>
                        <PrimaryButton 
                            onPress={handleDelete}
                            loading={deleting}
                            className="flex-1"
                            variant="filled"
                            style={{ backgroundColor: '#ef4444' }}
                        >
                            <Text className="text-white font-bold">{t('common.delete', 'Eliminar')}</Text>
                        </PrimaryButton>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
