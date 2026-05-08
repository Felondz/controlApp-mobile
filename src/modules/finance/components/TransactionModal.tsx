import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Alert, Pressable, Switch } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCreateTransaccion, useCuentas, useCategorias } from '../../../hooks/graphql/useFinance';
import { translateCategoryName } from '../../../shared/category';
import { Input, PrimaryButton, SecondaryButton, Modal, InputLabel, Select } from '../../../shared/components';
import { 
    PersonalFinanceIcon, 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    DocumentTextIcon,
    CalendarIcon
} from '../../../shared/icons';
import { maskCurrency as currencyMask, parseToCents } from '../../../shared/currency';
import DatePicker from '../../../shared/components/inputs/DatePicker';

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    proyectoId: string;
    type: 'income' | 'expense' | 'invoice';
}

export const TransactionModal = ({ visible, onClose, proyectoId, type }: TransactionModalProps) => {
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    const queryClient = useQueryClient();
    
    const { data: accountsData = [] } = useCuentas(proyectoId);
    const accounts = Array.isArray(accountsData) ? accountsData : [];
    
    const { data: categories = [] } = useCategorias(proyectoId);
    const { mutateAsync: createTransaccion, isPending } = useCreateTransaccion();

    const [form, setForm] = useState({
        monto: '',
        cuenta_id: '',
        categoria_id: '',
        custom_category_id: '',
        titulo: '',
        fecha: new Date().toISOString().split('T')[0],
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurrence_day: '1',
        cuenta_predeterminada_id: '',
        numero_factura: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const accountCurrency = useMemo(() => {
        const acc = accounts?.find(a => a.id === form.cuenta_id);
        return acc?.moneda || 'COP';
    }, [form.cuenta_id, accounts]);

    useEffect(() => {
        if (visible) {
            setForm({
                monto: '',
                cuenta_id: accounts?.[0]?.id || '',
                categoria_id: '',
                custom_category_id: '',
                titulo: '',
                fecha: new Date().toISOString().split('T')[0],
                fecha_emision: new Date().toISOString().split('T')[0],
                fecha_vencimiento: new Date().toISOString().split('T')[0],
                is_recurring: false,
                recurrence_day: '1',
                cuenta_predeterminada_id: accounts?.[0]?.id || '',
                numero_factura: '',
            });
            setErrors({});
        }
    }, [visible, accounts]);

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        const amountValue = parseToCents(form.monto, accountCurrency);
        
        if (amountValue === 0) newErrors.monto = t('common.required');
        if (!form.cuenta_id) newErrors.cuenta_id = t('common.required'); 
        if (type === 'invoice') {
            if (!form.titulo) newErrors.titulo = t('common.required');
            if (!form.fecha_vencimiento) newErrors.fecha_vencimiento = t('finance.error_due_date');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const unitValue = parseToCents(form.monto, accountCurrency);
            const finalAmount = type === 'income' ? unitValue : -Math.abs(unitValue);
            const isIncome = type === 'income';
            const catType = isIncome ? 'ingreso' : 'egreso';

            const fallbackCat = categories?.find(c => 
                c.tipo?.toLowerCase() === catType && 
                (type === 'invoice' ? c.nombre.toLowerCase().includes('factura') : true)
            ) || categories?.find(c => c.tipo?.toLowerCase() === catType) || categories?.[0];

            const variables = {
                proyecto_id: proyectoId,
                cuenta_id: form.cuenta_id,
                categoria_id: form.categoria_id || fallbackCat?.id,
                monto: finalAmount,
                fecha: type === 'invoice' ? form.fecha_vencimiento : form.fecha,
                titulo: form.titulo || undefined,
                descripcion: form.titulo || undefined,
                status: type === 'invoice' ? 'pending' : 'completed',
                is_recurring: form.is_recurring,
                recurrence_day: (form.is_recurring && form.recurrence_day) ? parseInt(form.recurrence_day) : undefined,
                cuenta_predeterminada_id: type === 'invoice' ? (form.cuenta_predeterminada_id || form.cuenta_id) : undefined,
                numero_factura: type === 'invoice' ? form.numero_factura : undefined,
                fecha_emision: type === 'invoice' ? form.fecha_emision : undefined,
                fecha_vencimiento: type === 'invoice' ? form.fecha_vencimiento : undefined,
            };

            await createTransaccion(variables);
            onClose();
        } catch (error: any) {
            Alert.alert(t('common.error'), t('finance.transaction_create_error'));
        }
    };

    const dayOptions = useMemo(() => 
        Array.from({ length: 30 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() })), 
    []);

    const headerColor = type === 'income' ? '#10b981' : type === 'expense' ? '#ef4444' : theme.primary600;

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title={type === 'income' ? t('finance.register_income') : type === 'expense' ? t('finance.register_expense') : t('finance.register_invoice')}
            headerBackgroundColor={headerColor}
            headerTextColor="white"
            scrollable={true}
        >
            <View className="px-6 gap-6 pt-6 pb-20">
                <Input
                    label={t('finance.amount')}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={form.monto}
                    onChangeText={(text) => setForm({ ...form, monto: currencyMask(text, accountCurrency) })}
                    error={errors.monto}
                    required
                    icon={CurrencyDollarIcon}
                />

                <Input
                    label={type === 'invoice' ? t('finance.company_concept', 'Concepto / Empresa') : t('common.title')}
                    placeholder={type === 'invoice' ? 'Ej. Claro, Arriendo...' : t('finance.title_placeholder')}
                    value={form.titulo}
                    onChangeText={(text) => setForm({ ...form, titulo: text })}
                    error={errors.titulo}
                    required={type === 'invoice'}
                />

                {type === 'invoice' && (
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Input
                                label={t('finance.invoice_number', 'N° Factura')}
                                placeholder="Ej. FAC-123"
                                value={form.numero_factura}
                                onChangeText={(text) => setForm({ ...form, numero_factura: text })}
                            />
                        </View>
                        <View className="flex-1">
                            <DatePicker
                                label={t('finance.emission_date', 'Fecha Emisión')}
                                value={form.fecha_emision}
                                onChange={(date) => setForm({ ...form, fecha_emision: date })}
                            />
                        </View>
                    </View>
                )}

                <DatePicker
                    label={type === 'invoice' ? t('finance.due_date', 'Vencimiento') : t('common.date')}
                    value={type === 'invoice' ? form.fecha_vencimiento : form.fecha}
                    onChange={(date) => setForm({ 
                        ...form, 
                        [type === 'invoice' ? 'fecha_vencimiento' : 'fecha']: date 
                    })}
                    error={type === 'invoice' ? errors.fecha_vencimiento : errors.fecha}
                    required={type === 'invoice'}
                />

                <View>
                    <InputLabel>{t('finance.account')}</InputLabel>
                    <View className="flex-row flex-wrap gap-2">
                        {accounts?.map((acc) => (
                            <Pressable
                                key={acc.id}
                                onPress={() => setForm({ ...form, cuenta_id: acc.id })}
                                className={`px-4 py-2 rounded-xl border-2 flex-row items-center ${
                                    form.cuenta_id === acc.id 
                                        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500' 
                                        : 'bg-white dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                                }`}
                            >
                                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: acc.color || theme.primary600 }} />
                                <Text className={`font-bold text-sm ${form.cuenta_id === acc.id ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-600'}`}>
                                    {acc.nombre}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {type === 'invoice' && (
                    <View className="bg-secondary-50 dark:bg-secondary-900/40 p-5 rounded-3xl border border-secondary-200 dark:border-secondary-800">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 mr-4">
                                <Text className="text-secondary-900 dark:text-white font-bold text-sm">
                                    {t('finance.is_recurring', 'Gasto Recurrente')}
                                </Text>
                                <Text className="text-secondary-500 text-[10px] mt-0.5">
                                    {t('finance.recurring_hint', 'Se generará automáticamente cada mes')}
                                </Text>
                            </View>
                            <Switch
                                value={form.is_recurring}
                                onValueChange={(val) => setForm({ ...form, is_recurring: val })}
                                trackColor={{ false: '#d1d5db', true: theme.primary500 }}
                            />
                        </View>

                        {form.is_recurring && (
                            <View className="mt-5 gap-4 pt-5 border-t border-secondary-100 dark:border-secondary-800">
                                <Select
                                    label={t('finance.recurrence_day', 'Día de Pago')}
                                    options={dayOptions}
                                    value={form.recurrence_day}
                                    onValueChange={(val) => setForm({ ...form, recurrence_day: val })}
                                    icon={CalendarIcon}
                                />
                                <View>
                                    <InputLabel>{t('finance.default_account', 'Cuenta de Pago')}</InputLabel>
                                    <View className="flex-row flex-wrap gap-2">
                                        {accounts?.map((acc) => (
                                            <Pressable
                                                key={acc.id}
                                                onPress={() => setForm({ ...form, cuenta_predeterminada_id: acc.id })}
                                                className={`px-3 py-1.5 rounded-lg border-2 flex-row items-center ${
                                                    form.cuenta_predeterminada_id === acc.id 
                                                        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500' 
                                                        : 'bg-white dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                                                }`}
                                            >
                                                <Text className={`font-bold text-xs ${form.cuenta_predeterminada_id === acc.id ? 'text-primary-700' : 'text-secondary-600'}`}>
                                                    {acc.nombre}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                <View className="flex-row gap-4 mt-2">
                    <SecondaryButton onPress={onClose} className="flex-1 rounded-2xl" size="lg">
                        {t('common.cancel')}
                    </SecondaryButton>
                    <PrimaryButton 
                        onPress={handleSave} 
                        loading={isPending} 
                        variant="filled" 
                        className="flex-1 rounded-2xl" 
                        size="lg" 
                        style={{ backgroundColor: headerColor }}
                    >
                        {t('common.save')}
                    </PrimaryButton>
                </View>

                <View style={{ height: 100 }} />
            </View>
        </Modal>
    );
};
