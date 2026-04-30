import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslate } from '../../hooks';
import { PlusIcon, MinusIcon } from '../../icons';
import { TransactionModal } from '../../../modules/finance/components/TransactionModal';

interface FinanceQuickActionsProps {
    proyectoId: number;
    className?: string;
}

export const FinanceQuickActions = ({ proyectoId, className = '' }: FinanceQuickActionsProps) => {
    const { t } = useTranslate();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('income');

    const handlePress = (type: 'income' | 'expense') => {
        setModalType(type);
        setModalVisible(true);
    };

    return (
        <View className={`flex-row gap-2 ${className}`}>
            <Pressable
                className="flex-1 flex-row items-center justify-center bg-green-50 dark:bg-green-900/20 py-2.5 px-2 rounded-xl border border-green-100 dark:border-green-800 active:opacity-70"
                onPress={(e) => {
                    e.stopPropagation();
                    handlePress('income');
                }}
            >
                <PlusIcon size={12} color="#10b981" />
                <Text 
                    className="text-green-700 dark:text-green-400 text-xs font-black tracking-tighter ml-1"
                    numberOfLines={1}
                >
                    {t('finance.income')}
                </Text>
            </Pressable>

            <Pressable
                className="flex-1 flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 py-2.5 px-2 rounded-xl border border-red-100 dark:border-red-800 active:opacity-70"
                onPress={(e) => {
                    e.stopPropagation();
                    handlePress('expense');
                }}
            >
                <MinusIcon size={12} color="#ef4444" />
                <Text 
                    className="text-red-700 dark:text-red-400 text-xs font-black tracking-tighter ml-1"
                    numberOfLines={1}
                >
                    {t('finance.expense')}
                </Text>
            </Pressable>

            <TransactionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                proyectoId={proyectoId}
                type={modalType}
            />
        </View>
    );
};
