import React, { useState } from 'react';
import { View, Text, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslate } from '../../../shared/hooks';
import { useSettingsStore } from '../../../stores/settingsStore';
import { getTheme } from '../../../shared/themes';
import { PrimaryButton, SecondaryButton, Input } from '../../../shared/components';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_TRANSACCION } from '../../../services/graphql/mutations';
import { gql } from '@apollo/client';

const GET_CUENTAS_CATEGORIAS = gql`
    query GetCuentasCategorias($proyecto_id: Int!) {
        cuentas(proyecto_id: $proyecto_id) {
            id
            nombre
        }
        categorias(proyecto_id: $proyecto_id) {
            id
            nombre
            tipo
        }
    }
`;

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    proyectoId: number;
    type: 'ingreso' | 'egreso';
}

export const TransactionModal = ({ visible, onClose, proyectoId, type }: TransactionModalProps) => {
    const { t } = useTranslate();
    const { theme: themeName, isDark } = useSettingsStore();
    const theme = getTheme(themeName);

    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [accountId, setAccountId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | null>(null);

    const { data, loading } = useQuery<any>(GET_CUENTAS_CATEGORIAS, {
        variables: { proyecto_id: proyectoId },
        skip: !visible,
    });

    const [createTransaction, { loading: saving }] = useMutation(CREATE_TRANSACCION, {
        onCompleted: () => {
            reset();
            onClose();
        },
        refetchQueries: ['GetBalance', 'GetTransacciones'],
    });

    const reset = () => {
        setAmount('');
        setTitle('');
        setAccountId(null);
        setCategoryId(null);
    };

    const handleSave = () => {
        if (!amount || !accountId || !categoryId) return;
        createTransaction({
            variables: {
                proyecto_id: proyectoId,
                monto: parseFloat(amount),
                titulo: title || (type === 'ingreso' ? 'Ingreso' : 'Egreso'),
                cuenta_id: accountId,
                categoria_id: categoryId,
                fecha: new Date().toISOString().split('T')[0],
                status: 'completada'
            }
        });
    };

    const isIncome = type === 'ingreso';
    const colorClass = isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const bgClass = isIncome ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';

    const validCategories = data?.categorias?.filter((c: any) => c.tipo === type) || [];
    const accounts = data?.cuentas || [];

    // Auto-select first account and category if not selected
    if (!loading && accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id);
    }
    if (!loading && validCategories.length > 0 && !categoryId) {
        setCategoryId(validCategories[0].id);
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/40">
                <View className="bg-white dark:bg-secondary-900 rounded-t-[32px] p-6 max-h-[90%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className={`text-xl font-black ${colorClass}`}>
                            {isIncome ? t('finance.register_income') : t('finance.register_expense')}
                        </Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View className="gap-4 pb-8">
                            <Input
                                label={t('finance.amount')}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="0.00"
                            />
                            
                            <Input
                                label={t('common.title', 'Título')}
                                value={title}
                                onChangeText={setTitle}
                                placeholder={isIncome ? 'Venta de servicios' : 'Compra de materiales'}
                            />

                            {/* Minimalist "Selects" for accounts and categories since we don't have a Dropdown component right here */}
                            <View>
                                <Text className="text-xs font-bold text-secondary-500 mb-2">{t('finance.account')}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {accounts.map((acc: any) => (
                                        <SecondaryButton
                                            key={acc.id}
                                            variant={accountId === acc.id ? 'default' : 'outline'}
                                            onPress={() => setAccountId(acc.id)}
                                            size="sm"
                                        >
                                            {acc.nombre}
                                        </SecondaryButton>
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text className="text-xs font-bold text-secondary-500 mb-2">{t('finance.category')}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {validCategories.map((cat: any) => (
                                        <SecondaryButton
                                            key={cat.id}
                                            variant={categoryId === cat.id ? 'default' : 'outline'}
                                            onPress={() => setCategoryId(cat.id)}
                                            size="sm"
                                        >
                                            {cat.nombre}
                                        </SecondaryButton>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View className="flex-row gap-3 mt-4">
                        <SecondaryButton variant="outline" onPress={onClose} fullWidth className="flex-1">
                            {t('common.cancel')}
                        </SecondaryButton>
                        <PrimaryButton 
                            onPress={handleSave} 
                            loading={saving} 
                            disabled={!amount || !accountId || !categoryId} 
                            fullWidth 
                            className={`flex-1 ${isIncome ? 'bg-green-600' : 'bg-red-600'}`}
                        >
                            {t('common.save')}
                        </PrimaryButton>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
