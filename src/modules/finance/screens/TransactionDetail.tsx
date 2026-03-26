import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTranslate } from '../../../shared/hooks/useTranslate';
import { useTransaccion, useUpdateTransaccion, useCuentas, useCategorias, Transaccion } from '../useFinance';
import { useProjectStore } from '../../../stores/projectStore';
import { useSettingsStore } from '../../../stores/settingsStore';
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

interface TransactionDetailProps {
    transactionId: string;
    onBack?: () => void;
}

type EditableField = 'titulo' | 'monto';

export default function TransactionDetail({ transactionId, onBack }: TransactionDetailProps) {
    const { t } = useTranslate();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    const { isDark } = useSettingsStore();
    
    const { data, loading, error, refetch } = useTransaccion(transactionId);
    const { data: cuentasData } = useCuentas(activeProject?.id ?? 0);
    const { data: categoriasData } = useCategorias(activeProject?.id ?? 0);
    const [updateTransaccion, { loading: updating }] = useUpdateTransaccion();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedTrans, setEditedTrans] = useState<Partial<Transaccion>>({});

    useEffect(() => {
        if (data?.transaccion) {
            setEditedTrans(data.transaccion);
        }
    }, [data]);

    const textColor = isDark ? 'text-white' : 'text-secondary-900';
    const textSecondary = isDark ? 'text-secondary-400' : 'text-secondary-500';
    const cardBg = isDark ? 'bg-secondary-800' : 'bg-white';
    const borderColor = isDark ? 'border-secondary-700' : 'border-secondary-200';
    const inputBg = isDark ? 'bg-secondary-700' : 'bg-secondary-50';

    const handleSave = async () => {
        if (!activeProject || !editedTrans.id) return;
        
        try {
            await updateTransaccion({
                variables: {
                    id: editedTrans.id,
                    proyecto_id: activeProject.id,
                    titulo: editedTrans.titulo || '',
                    monto: editedTrans.monto || 0,
                }
            });
            setIsEditing(false);
            refetch();
            Alert.alert('Éxito', 'Transacción actualizada correctamente');
        } catch (err) {
            console.error('Error updating transaction:', err);
            Alert.alert('Error', 'No se pudo actualizar la transacción');
        }
    };

    const handleCancel = () => {
        if (data?.transaccion) {
            setEditedTrans(data.transaccion);
        }
        setIsEditing(false);
    };

    const formatMonto = (monto: number) => {
        const isIncome = monto > 0;
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(Math.abs(monto) / 100);
    };

    if (loading) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
                <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b`}>
                    <SkeletonList count={3} />
                </View>
            </View>
        );
    }

    if (error || !data?.transaccion) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'} justify-center items-center`}>
                <Text className={textSecondary}>{t('common.error', 'Error al cargar')}</Text>
                <SecondaryButton onPress={() => refetch()} className="mt-4">
                    {t('common.retry', 'Reintentar')}
                </SecondaryButton>
            </View>
        );
    }

    const trans = isEditing ? editedTrans : data.transaccion;
    const isIncome = (trans.monto ?? 0) > 0;
    const cuentas = cuentasData?.cuentas || [];
    const categorias = categoriasData?.categorias || [];
    const cuenta = cuentas.find(c => String(c.id) === String(trans.cuenta_id));
    const categoria = categorias.find(c => String(c.id) === String(trans.categoria_id));

    return (
        <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
            <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b flex-row items-center justify-between`}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={onBack || (() => router.back())} className="mr-3">
                        <ArrowLeftIcon size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-bold ${textColor}`}>
                        {t('finance.transaction_detail', 'Detalle de Transacción')}
                    </Text>
                </View>
                {!isEditing ? (
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-row items-center">
                        <PencilIcon size={18} color={isDark ? '#818cf8' : '#6366f1'} />
                        <Text className={`ml-1 text-sm font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                            {t('common.edit', 'Editar')}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity onPress={handleCancel}>
                            <XIcon size={24} color="#ef4444" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} disabled={updating}>
                            <CheckIcon size={24} color={updating ? textSecondary : '#22c55e'} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1 p-4">
                <View className={`${cardBg} ${borderColor} border rounded-xl p-4 mb-4`}>
                    <View className="flex-row items-center mb-4">
                        <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${
                            isIncome 
                                ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                                : isDark ? 'bg-red-900/30' : 'bg-red-100'
                        }`}>
                            {isIncome ? (
                                <ArrowTrendingUpIcon size={28} color={isIncome ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626')} />
                            ) : (
                                <ArrowTrendingDownIcon size={28} color={isDark ? '#f87171' : '#dc2626'} />
                            )}
                        </View>
                        <View className="flex-1">
                            {isEditing ? (
                                <TextInput
                                    value={trans.titulo || ''}
                                    onChangeText={(text) => setEditedTrans(prev => ({ ...prev, titulo: text }))}
                                    className={`text-xl font-bold ${inputBg} ${borderColor} border rounded-lg px-3 py-1 ${textColor}`}
                                    placeholderTextColor={textSecondary}
                                />
                            ) : (
                                <Text className={`text-xl font-bold ${textColor}`}>
                                    {trans.titulo || t('finance.no_description', 'Sin descripción')}
                                </Text>
                            )}
                            <Text className={`text-sm ${textSecondary}`}>
                                {trans.fecha ? new Date(trans.fecha).toLocaleDateString('es-CO', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : '-'}
                            </Text>
                        </View>
                        <View className={`text-2xl font-bold ${
                            isIncome 
                                ? isDark ? 'text-green-400' : 'text-green-600'
                                : isDark ? 'text-red-400' : 'text-red-600'
                        }`}>
                            {isIncome ? '+' : '-'}{formatMonto(trans.monto ?? 0)}
                        </View>
                    </View>

                    <View className={`h-px ${borderColor} my-4`} />

                    <View className="space-y-4">
                        <View className="flex-row items-center">
                            <FolderIcon size={18} color={textSecondary} />
                            <Text className={`text-sm ${textSecondary} ml-3 w-24`}>
                                {t('finance.account', 'Cuenta')}:
                            </Text>
                            <Text className={`flex-1 ${textColor}`}>
                                {cuenta?.nombre || '-'}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <TagIcon size={18} color={textSecondary} />
                            <Text className={`text-sm ${textSecondary} ml-3 w-24`}>
                                {t('finance.category', 'Categoría')}:
                            </Text>
                            <Text className={`flex-1 ${textColor}`}>
                                {categoria?.nombre || '-'}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <CalendarIcon size={18} color={textSecondary} />
                            <Text className={`text-sm ${textSecondary} ml-3 w-24`}>
                                {t('finance.date', 'Fecha')}:
                            </Text>
                            <Text className={`flex-1 ${textColor}`}>
                                {trans.fecha ? new Date(trans.fecha).toLocaleDateString() : '-'}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Text className={`text-sm ${textSecondary} w-24`}>
                                ID:
                            </Text>
                            <Text className={`flex-1 ${textSecondary} font-mono text-xs`}>
                                #{trans.id}
                            </Text>
                        </View>
                    </View>
                </View>

                {isEditing && (
                    <View className={`${cardBg} ${borderColor} border rounded-xl p-4 mb-4`}>
                        <Text className={`text-sm font-medium ${textSecondary} mb-2`}>
                            {t('finance.amount', 'Monto')} (en centavos):
                        </Text>
                        <TextInput
                            value={String(trans.monto ?? 0)}
                            onChangeText={(text) => setEditedTrans(prev => ({ 
                                ...prev, 
                                monto: parseInt(text) || 0 
                            }))}
                            keyboardType="numeric"
                            className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2 ${textColor}`}
                            placeholderTextColor={textSecondary}
                        />
                        <Text className={`text-xs ${textSecondary} mt-1`}>
                            {t('finance.amount_hint', 'Ingresa el monto en centavos. Positivo para ingresos, negativo para gastos.')}
                        </Text>
                    </View>
                )}

                {isEditing && (
                    <PrimaryButton
                        onPress={handleSave}
                        loading={updating}
                        className="mb-4"
                    >
                        {t('common.save', 'Guardar Cambios')}
                    </PrimaryButton>
                )}
            </ScrollView>
        </View>
    );
}
