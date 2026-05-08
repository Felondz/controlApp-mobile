import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTranslate } from '../../../shared/hooks/useTranslate';
import { 
    useTransaccion, 
    useUpdateTransaccion, 
    useCuentas, 
    useCategorias, 
    Transaccion 
} from '../../../hooks/graphql/useFinance';
import { useProjectStore } from '../../../stores/projectStore';
import { useAppTheme } from '../../../shared/hooks';
import { useRouter } from 'expo-router';
import { 
    ArrowLeftIcon,
    PencilIcon,
    XIcon,
    CheckIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    FolderIcon,
    TagIcon,
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import { SkeletonList } from '../../../shared/components/Skeleton';
import { formatCurrency } from '../../../shared/currency';

interface TransactionDetailProps {
    transactionId: string;
    onBack?: () => void;
}

export default function TransactionDetail({ transactionId, onBack }: TransactionDetailProps) {
    const { t } = useTranslate();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    const { theme, isDark } = useAppTheme();
    
    const { data: trans, isLoading, isError, refetch } = useTransaccion(transactionId);
    const { data: cuentas = [] } = useCuentas(activeProject?.id ?? '');
    const { data: categorias = [] } = useCategorias(activeProject?.id ?? '');
    const { mutateAsync: updateTransaccion, isPending: updating } = useUpdateTransaccion();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedTrans, setEditedTrans] = useState<Partial<Transaccion>>({});

    useEffect(() => {
        if (trans) {
            setEditedTrans(trans);
        }
    }, [trans]);

    const textColor = isDark ? 'text-white' : 'text-secondary-900';
    const textSecondary = isDark ? 'text-secondary-400' : 'text-secondary-500';
    const cardBg = isDark ? 'bg-secondary-800' : 'bg-white';
    const borderColor = isDark ? 'border-secondary-700' : 'border-secondary-200';
    const inputBg = isDark ? 'bg-secondary-700' : 'bg-secondary-50';

    const handleSave = async () => {
        if (!activeProject || !editedTrans.id) return;
        
        try {
            await updateTransaccion({
                id: editedTrans.id,
                titulo: editedTrans.titulo || '',
                monto: editedTrans.monto || 0,
            });
            setIsEditing(false);
            refetch();
            Alert.alert(t('common.success', 'Éxito'), t('finance.transaction_update_success', 'Transacción actualizada correctamente'));
        } catch (err) {
            console.error('Error updating transaction:', err);
            Alert.alert(t('common.error', 'Error'), t('finance.transaction_update_error', 'No se pudo actualizar la transacción'));
        }
    };

    const handleCancel = () => {
        if (trans) {
            setEditedTrans(trans);
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
                <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b`}>
                    <SkeletonList count={3} />
                </View>
            </View>
        );
    }

    if (isError || !trans) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'} justify-center items-center`}>
                <Text className={textSecondary}>{t('common.error', 'Error al cargar')}</Text>
                <SecondaryButton onPress={() => refetch()} className="mt-4">
                    {t('common.retry', 'Reintentar')}
                </SecondaryButton>
            </View>
        );
    }

    const currentTrans = isEditing ? editedTrans : trans;
    const isIncome = (currentTrans.monto ?? 0) > 0;
    const cuenta = cuentas.find(c => String(c.id) === String(currentTrans.cuenta_id));
    const categoria = categorias.find(c => String(c.id) === String(currentTrans.categoria_id));

    return (
        <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
            <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b flex-row items-center justify-between`}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={onBack || (() => router.back())} className="mr-3">
                        <ArrowLeftIcon size={24} color={isDark ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-bold ${textColor}`}>
                        {t('finance.transaction_detail', 'Detalle de Transacción')}
                    </Text>
                </View>
                {!isEditing ? (
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-row items-center">
                        <PencilIcon size={18} color={theme.primary600} />
                        <Text className={`ml-1 text-base font-medium`} style={{ color: theme.primary600 }}>
                            {t('common.edit', 'Editar')}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity onPress={handleCancel}>
                            <XIcon size={24} color="#ef4444" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} disabled={updating}>
                            <CheckIcon size={24} color={updating ? '#94a3b8' : '#22c55e'} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className={`${cardBg} ${borderColor} border rounded-2xl p-5 mb-6 shadow-sm`}>
                    <View className="flex-row items-center mb-5">
                        <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                            isIncome 
                                ? isDark ? 'bg-green-900/30' : 'bg-green-50'
                                : isDark ? 'bg-red-900/30' : 'bg-red-50'
                        }`}>
                            {isIncome ? (
                                <ArrowTrendingUpIcon size={24} color="#10b981" />
                            ) : (
                                <ArrowTrendingDownIcon size={24} color="#ef4444" />
                            )}
                        </View>
                        <View className="flex-1">
                            {isEditing ? (
                                <TextInput
                                    value={currentTrans.titulo || ''}
                                    onChangeText={(text) => setEditedTrans(prev => ({ ...prev, titulo: text }))}
                                    className={`text-lg font-bold ${inputBg} ${borderColor} border rounded-xl px-3 py-1.5 ${textColor}`}
                                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                />
                            ) : (
                                <Text className={`text-lg font-bold ${textColor}`} numberOfLines={1}>
                                    {currentTrans.titulo || t('finance.no_description', 'Sin descripción')}
                                </Text>
                            )}
                            <Text className={`text-sm font-bold ${textSecondary} mt-0.5`}>
                                {currentTrans.fecha ? new Date(currentTrans.fecha).toLocaleDateString('es-CO', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : '-'}
                            </Text>
                        </View>
                    </View>

                    <View className="items-center py-4 mb-5 bg-secondary-50/50 dark:bg-secondary-900/30 rounded-2xl border border-secondary-100 dark:border-secondary-700/50">
                        <Text className={`text-sm font-bold ${textSecondary} mb-1`}>
                            {isIncome ? t('finance.income', 'Ingreso') : t('finance.expense', 'Gasto')}
                        </Text>
                        <Text className={`text-3xl font-black ${
                            isIncome 
                                ? isDark ? 'text-green-400' : 'text-green-600'
                                : isDark ? 'text-red-400' : 'text-red-600'
                        }`}>
                            {isIncome ? '+ ' : '- '}{formatCurrency(Math.abs(currentTrans.monto ?? 0), cuenta?.moneda)}
                        </Text>
                    </View>

                    <View className="gap-4">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg items-center justify-center bg-secondary-100 dark:bg-secondary-700">
                                <FolderIcon size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <Text className={`text-sm font-bold ${textSecondary} ml-3 w-20`}>
                                {t('finance.account', 'Cuenta')}:
                            </Text>
                            <Text className={`flex-1 text-base font-bold ${textColor}`}>
                                {cuenta?.nombre || '-'}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg items-center justify-center bg-secondary-100 dark:bg-secondary-700">
                                <TagIcon size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <Text className={`text-sm font-bold ${textSecondary} ml-3 w-20`}>
                                {t('finance.category', 'Categoría')}:
                            </Text>
                            <Text className={`flex-1 text-base font-bold ${textColor}`}>
                                {categoria?.nombre || '-'}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg items-center justify-center bg-secondary-100 dark:bg-secondary-700">
                                <CalendarIcon size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <Text className={`text-sm font-bold ${textSecondary} ml-3 w-20`}>
                                {t('finance.date', 'Fecha')}:
                            </Text>
                            <Text className={`flex-1 text-base font-bold ${textColor}`}>
                                {currentTrans.fecha ? new Date(currentTrans.fecha).toLocaleDateString() : '-'}
                            </Text>
                        </View>
                    </View>
                </View>

                {isEditing && (
                    <View className={`${cardBg} ${borderColor} border rounded-2xl p-5 mb-6 shadow-sm`}>
                        <Text className={`text-sm font-bold text-secondary-500 dark:text-secondary-400 mb-2 ml-1`}>
                            {t('finance.amount', 'Monto')}:
                        </Text>
                        <TextInput
                            value={String(currentTrans.monto ?? 0)}
                            onChangeText={(text) => setEditedTrans(prev => ({ 
                                ...prev, 
                                monto: parseInt(text) || 0 
                            }))}
                            keyboardType="numeric"
                            className={`${inputBg} ${borderColor} border rounded-xl px-4 py-3 text-base font-bold ${textColor}`}
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        />
                        <Text className={`text-sm font-medium ${textSecondary} mt-2 ml-1`}>
                            {t('finance.amount_hint', 'Ingresa el monto en centavos. Positivo para ingresos, negativo para gastos.')}
                        </Text>
                    </View>
                )}

                {isEditing && (
                    <PrimaryButton
                        onPress={handleSave}
                        loading={updating}
                        className="mb-10"
                    >
                        {t('common.save', 'Guardar Cambios')}
                    </PrimaryButton>
                )}
            </ScrollView>
        </View>
    );
}
