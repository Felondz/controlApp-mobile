import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCreateTransaccion, useCuentas, useCategorias } from '../../../hooks/graphql/useFinance';
import Modal from '../../../shared/components/Modal';
import Input from '../../../shared/components/Input';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import { formatCurrency } from '../../../shared/currency';

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    proyectoId: number;
    type: 'income' | 'expense' | 'invoice';
}

export const TransactionModal = ({ visible, onClose, proyectoId, type }: TransactionModalProps) => {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const { mutateAsync: createTransaccion, isPending } = useCreateTransaccion();
    const { data: accounts } = useCuentas(proyectoId);
    const { data: categories } = useCategorias(proyectoId);

    const [form, setForm] = useState({
        titulo: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        cuenta_id: '',
        categoria_id: '',
        notas: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (visible) {
            // Reset form when opening
            setForm({
                titulo: '',
                monto: '',
                fecha: new Date().toISOString().split('T')[0],
                cuenta_id: accounts?.[0]?.id || '',
                categoria_id: '',
                notas: '',
            });
            setErrors({});
        }
    }, [visible, accounts]);

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        if (!form.monto) newErrors.monto = t('common.required');
        if (!form.cuenta_id) newErrors.cuenta_id = t('common.required');
        if (!form.categoria_id) newErrors.categoria_id = t('common.required');

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Amount is positive for income, negative for expense/invoice
            const finalAmount = type === 'income' ? parseFloat(form.monto) : -Math.abs(parseFloat(form.monto));

            await createTransaccion({
                proyecto_id: proyectoId,
                cuenta_id: parseInt(form.cuenta_id),
                categoria_id: parseInt(form.categoria_id),
                monto: finalAmount,
                fecha: form.fecha,
                titulo: form.titulo || undefined,
                notas: form.notas || undefined,
                status: type === 'invoice' ? 'pending' : 'completed',
            });
            
            onClose();
        } catch (error) {
            console.error('Error creating transaction:', error);
            Alert.alert(t('common.error'), t('finance.transaction_create_error', 'Error al registrar la operación'));
        }
    };

    const modalTitle = type === 'income' 
        ? t('finance.register_income', 'Registrar Ingreso')
        : type === 'expense'
            ? t('finance.register_expense', 'Registrar Gasto')
            : t('finance.register_invoice', 'Registrar Factura');

    const headerColor = type === 'income' ? '#10b981' : type === 'expense' ? '#ef4444' : theme.primary600;

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title={modalTitle}
            headerBackgroundColor={headerColor}
            headerTextColor="white"
        >
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                <View className="gap-5 pb-10">
                    <Input
                        label={t('finance.amount', 'Monto')}
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={form.monto}
                        onChangeText={(text) => setForm({ ...form, monto: text })}
                        error={errors.monto}
                        required
                    />

                    <Input
                        label={t('common.title', 'Título / Concepto')}
                        placeholder="Ej. Pago de servicios"
                        value={form.titulo}
                        onChangeText={(text) => setForm({ ...form, titulo: text })}
                    />

                    <View>
                        <Text className="text-secondary-400 dark:text-secondary-500 text-xs font-black uppercase tracking-widest mb-2">
                            {t('finance.account', 'Cuenta')}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            {accounts?.map((acc) => (
                                <PrimaryButton
                                    key={acc.id}
                                    onPress={() => setForm({ ...form, cuenta_id: acc.id })}
                                    variant={form.cuenta_id === acc.id ? 'filled' : 'outline'}
                                    size="sm"
                                    style={form.cuenta_id === acc.id ? { backgroundColor: acc.color || theme.primary600 } : {}}
                                >
                                    <Text className={form.cuenta_id === acc.id ? 'text-white font-bold' : 'text-secondary-600 font-bold'}>
                                        {acc.nombre}
                                    </Text>
                                </PrimaryButton>
                            ))}
                        </ScrollView>
                        {errors.cuenta_id && <Text className="text-red-500 text-xs mt-1">{errors.cuenta_id}</Text>}
                    </View>

                    <View>
                        <Text className="text-secondary-400 dark:text-secondary-500 text-xs font-black uppercase tracking-widest mb-2">
                            {t('finance.category', 'Categoría')}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {categories?.filter(c => c.tipo === (type === 'income' ? 'ingreso' : 'egreso')).map((cat) => (
                                <PrimaryButton
                                    key={cat.id}
                                    onPress={() => setForm({ ...form, categoria_id: cat.id })}
                                    variant={form.categoria_id === cat.id ? 'filled' : 'outline'}
                                    size="sm"
                                >
                                    <Text className={form.categoria_id === cat.id ? 'text-white font-bold' : 'text-secondary-600 font-bold'}>
                                        {cat.nombre}
                                    </Text>
                                </PrimaryButton>
                            ))}
                        </View>
                        {errors.categoria_id && <Text className="text-red-500 text-xs mt-1">{errors.categoria_id}</Text>}
                    </View>

                    <Input
                        label={t('common.date', 'Fecha')}
                        value={form.fecha}
                        onChangeText={(text) => setForm({ ...form, fecha: text })}
                    />

                    <View className="flex-row gap-4 mt-4">
                        <SecondaryButton onPress={onClose} className="flex-1">
                            {t('common.cancel')}
                        </SecondaryButton>
                        <PrimaryButton 
                            onPress={handleSave} 
                            loading={isPending} 
                            className="flex-1"
                            style={{ backgroundColor: headerColor }}
                        >
                            {t('common.save')}
                        </PrimaryButton>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    );
};
