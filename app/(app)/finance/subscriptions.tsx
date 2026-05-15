import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, InteractionManager, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import { useProjectStore } from '../../../src/stores/projectStore';
import { useTransacciones } from '../../../src/hooks/graphql/useFinance';
import { formatCurrency } from '../../../src/shared/currency';
import { ArrowPathIcon, ChevronRightIcon, CalendarIcon } from '../../../src/shared/icons';
import { AppLayout } from '../../../src/shared/components/layouts/AppLayout';
import { Skeleton, PrimaryButton } from '../../../src/shared/components';
import { TransactionModal } from '../../../src/modules/finance/components/TransactionModal';
import { PlusIcon } from '../../../src/shared/icons';

const SubscriptionItem = React.memo(({ item, theme, t, onPress }: { item: any; theme: any; t: any; onPress: (item: any) => void }) => (
    <TouchableOpacity 
        onPress={() => onPress(item)}
        className="bg-white dark:bg-secondary-900 p-4 rounded-2xl mb-3 border border-secondary-100 dark:border-secondary-800 flex-row items-center active:opacity-70"
    >
        <View 
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: theme.primary50 }}
        >
            <ArrowPathIcon size={24} color={theme.primary600} />
        </View>
        <View className="flex-1">
            <Text className="text-secondary-900 dark:text-white font-black text-base" numberOfLines={1}>
                {item.titulo}
            </Text>
            <View className="flex-row items-center mt-1">
                <CalendarIcon size={12} color={theme.secondary400} />
                <Text className="text-secondary-500 dark:text-secondary-400 text-xs ml-1 font-medium">
                    {t('finance.recurrence_day')}: {item.recurrence_day}
                </Text>
            </View>
        </View>
        <View className="items-end mr-2">
            <Text className="text-red-600 dark:text-red-400 font-black text-base">
                -{formatCurrency(item.monto)}
            </Text>
            <Text className="text-[10px] font-bold text-secondary-400 uppercase tracking-tighter">
                {item.cuenta?.nombre}
            </Text>
        </View>
        <ChevronRightIcon size={16} color={theme.secondary300} />
    </TouchableOpacity>
));

export default function SubscriptionsScreen() {
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    const { activeProject } = useProjectStore();
    const [isReady, setIsReady] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => setIsReady(true));
        return () => task.cancel();
    }, []);

    const { data: transacciones, isLoading } = useTransacciones(activeProject?.id || '', 'active');

    const subscriptions = useMemo(() => {
        return transacciones?.filter((t: any) => t.is_recurring) || [];
    }, [transacciones]);

    const handleItemPress = useCallback((item: any) => {
        // Future detail view
    }, []);

    if (!isReady) {
        return (
            <View className="flex-1 bg-secondary-50 dark:bg-secondary-950 p-6">
                <Skeleton width="100%" height={100} count={5} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-3xl font-black text-secondary-900 dark:text-white tracking-tighter">
                        {t('finance.active_subscriptions')}
                    </Text>
                    <Text className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">
                        {t('finance.subscriptions_desc')}
                    </Text>
                </View>
                <TouchableOpacity 
                    onPress={() => setShowBillModal(true)}
                    className="w-12 h-12 rounded-2xl items-center justify-center shadow-lg"
                    style={{ backgroundColor: theme.primary600 }}
                >
                    <PlusIcon size={24} color="white" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={theme.primary600} />
                </View>
            ) : (
                <FlashList
                    data={subscriptions}
                    renderItem={({ item }) => (
                        <SubscriptionItem 
                            item={item} 
                            theme={theme} 
                            t={t} 
                            onPress={handleItemPress} 
                        />
                    )}
                    estimatedItemSize={84}
                    contentContainerStyle={{ padding: 24 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <ArrowPathIcon size={64} color={theme.secondary200} />
                            <Text className="text-secondary-400 font-bold mt-4 text-center">
                                {t('finance.no_subscriptions')}
                            </Text>
                        </View>
                    }
                />
            )}
            <TransactionModal 
                visible={showBillModal}
                onClose={() => setShowBillModal(false)}
                proyectoId={activeProject?.id || ''}
                type="invoice"
            />
        </View>
    );
}
