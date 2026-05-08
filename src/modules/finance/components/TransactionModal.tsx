import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Alert, Pressable, Switch } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCreateTransaccion, useCuentas, useCategorias } from '../../../hooks/graphql/useFinance';
import { translateCategoryName } from '../../../shared/category';
import Modal from '../../../shared/components/Modal';
import Input from '../../../shared/components/Input';
import InputLabel from '../../../shared/components/InputLabel';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import { maskCurrency, parseToCents } from '../../../shared/currency';
import { 
    TruckIcon, 
    ShoppingBagIcon, 
    BoltIcon, 
    HomeIcon, 
    EllipsisVerticalIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    BanknotesIcon
} from '../../../shared/icons';

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    proyectoId: string;
    type: 'income' | 'expense' | 'invoice';
}

export const TransactionModal = ({ visible, onClose, proyectoId, type }: TransactionModalProps) => {
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    const { mutateAsync: createTransaccion, isPending } = useCreateTransaccion();
    const { data: accounts } = useCuentas(proyectoId);
    const { data: categories } = useCategorias(proyectoId);
    
    const [form, setForm] = useState({
        titulo: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        cuenta_id: '',
        categoria_id: '',
        is_recurring: false,
        recurrence_day: new Date().getDate().toString(),
        cuenta_predeterminada_id: '',
        custom_category_id: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const gridCategories = useMemo(() => {
        if (type === 'income') {
            return [
                { id: 'salary', label: t('finance.categories.salary'), icon: BanknotesIcon, keywords: ['salario', 'nómina', 'sueldo'] },
                { id: 'business', label: t('finance.categories.business'), icon: ShoppingBagIcon, keywords: ['negocio', 'venta', 'empresa'] },
                { id: 'investments', label: t('finance.categories.investments'), icon: BoltIcon, keywords: ['inversión', 'interes', 'dividendos'] },
                { id: 'other', label: t('finance.categories.general_income'), icon: EllipsisVerticalIcon, keywords: ['otro', 'ingreso'] },
            ];
        }
        return [
            { id: 'transport', label: t('finance.categories.transport'), icon: TruckIcon, keywords: ['transporte', 'viaje', 'gasolina'] },
            { id: 'food', label: t('finance.categories.food'), icon: ShoppingBagIcon, keywords: ['alimentación', 'comida', 'restaurante'] },
            { id: 'bills', label: t('finance.categories.bills_and_services'), icon: BoltIcon, keywords: ['facturas', 'servicios', 'publicos'] },
            { id: 'home', label: t('finance.categories.home'), icon: HomeIcon, keywords: ['hogar', 'casa', 'vivienda'] },
            { id: 'other', label: t('finance.categories.other_expenses'), icon: EllipsisVerticalIcon, keywords: ['otro', 'gasto'] },
        ];
    }, [t, type]);

    const accountCurrency = accounts?.find(a => a.id === form.cuenta_id)?.moneda || 'COP';

    useEffect(() => {
        if (visible) {
            setForm({
                titulo: '',
                monto: '',
                fecha: new Date().toISOString().split('T')[0],
                cuenta_id: accounts?.[0]?.id || '',
                categoria_id: '',
                is_recurring: false,
                recurrence_day: new Date().getDate().toString(),
                cuenta_predeterminada_id: accounts?.[0]?.id || '',
                custom_category_id: '',
            });
            setErrors({});
        }
    }, [visible, accounts]);

    const handleCategoryGridSelect = (gridCat: any) => {
        const isIncome = type === 'income';
        const catType = isIncome ? 'ingreso' : 'egreso';
        
        // Try to find by keyword, then by type, then don't overwrite if already set
        const realCat = categories?.find(c => 
            c.tipo === catType && 
            gridCat.keywords.some((k: string) => c.nombre.toLowerCase().includes(k))
        ) || categories?.find(c => c.tipo === catType);

        setForm(prev => ({
            ...prev,
            custom_category_id: gridCat.id,
            categoria_id: realCat?.id || prev.categoria_id,
            titulo: gridCat.id === 'other' ? '' : gridCat.label
        }));
    };

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        const amountValue = parseToCents(form.monto, accountCurrency);
        
        if (amountValue === 0) newErrors.monto = t('common.required');
        if (!form.cuenta_id) newErrors.cuenta_id = t('common.required'); // Required for all in GraphQL
        if (type === 'invoice' && !form.titulo) newErrors.titulo = t('common.required');

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const unitValue = parseToCents(form.monto, accountCurrency);
            const finalAmount = type === 'income' ? unitValue : -Math.abs(unitValue);

            const isIncome = type === 'income';
            const catType = isIncome ? 'ingreso' : 'egreso';

            // Diagnostic log
            console.log(`[TransactionModal] Validating category. Type: ${type}, Searching for: ${catType}`);
            console.log(`[TransactionModal] Available categories count: ${categories?.length}`);
            if (categories && categories.length > 0) {
                console.log(`[TransactionModal] First category sample:`, JSON.stringify(categories[0]));
            }

            // 1. Prioritize explicitly selected category (DB or Grid)
            // 2. Fallback to default "Bills" category for invoices
            // 3. Fallback to first available category of the same type (case-insensitive)
            // 4. Absolute fallback to the first category in the list
            const fallbackCat = categories?.find(c => 
                c.tipo?.toLowerCase() === catType && 
                (type === 'invoice' ? c.nombre.toLowerCase().includes('factura') : true)
            ) || categories?.find(c => 
                c.tipo?.toLowerCase() === catType || 
                c.tipo?.toLowerCase() === type
            ) || categories?.[0];
            
            const finalCategoryId = form.categoria_id || fallbackCat?.id;

            if (!finalCategoryId) {
                Alert.alert(
                    t('common.error'), 
                    !categories || categories.length === 0 
                        ? t('finance.no_categories_error', 'This project has no categories. Please create one in the web version first.')
                        : t('finance.category_required')
                );
                return;
            }

            const variables = {
                proyecto_id: proyectoId,
                cuenta_id: form.cuenta_id,
                categoria_id: finalCategoryId,
                monto: finalAmount,
                fecha: form.fecha,
                descripcion: form.titulo || undefined,
                status: type === 'invoice' ? 'pending' : 'completed',
                is_recurring: form.is_recurring,
                recurrence_day: (form.is_recurring && form.recurrence_day) ? parseInt(form.recurrence_day) : undefined,
                cuenta_predeterminada_id: form.is_recurring ? form.cuenta_predeterminada_id : undefined,
            };

            console.log('[TransactionModal] Variables:', JSON.stringify(variables));

            await createTransaccion(variables);
            onClose();
        } catch (error: any) {
            console.error('Full Error Object:', JSON.stringify(error, null, 2));
            
            let errorMessage = t('finance.transaction_create_error');
            
            if (error?.response?.errors?.[0]?.message) {
                errorMessage += `\n\nDetail: ${error.response.errors[0].message}`;
            } else if (error?.message) {
                errorMessage += `\n\n${error.message}`;
            }

            Alert.alert(t('common.error'), errorMessage);
        }
    };

    const headerColor = type === 'income' ? '#10b981' : type === 'expense' ? '#ef4444' : theme.primary600;

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title={type === 'income' ? t('finance.register_income') : type === 'expense' ? t('finance.register_expense') : t('finance.register_invoice')}
            headerBackgroundColor={headerColor}
            headerTextColor="white"
        >
            <View className="flex-1">
                <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                    <View className="gap-6 pt-6 pb-6">
                        {/* Amount Input - Using standard Input component as per design system */}
                        <Input
                            label={t('finance.amount')}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={form.monto}
                            onChangeText={(text) => setForm({ ...form, monto: maskCurrency(text, accountCurrency) })}
                            error={errors.monto}
                            required
                            icon={CurrencyDollarIcon}
                        />

                        {/* Basic Info */}
                        <Input
                            label={type === 'invoice' ? t('finance.company_concept') : t('common.title')}
                            description={type === 'invoice' ? t('finance.company_hint') : ''}
                            placeholder={type === 'invoice' ? t('finance.company_hint') : t('finance.title_placeholder')}
                            value={form.titulo}
                            onChangeText={(text) => setForm({ ...form, titulo: text })}
                            error={errors.titulo}
                            required={type === 'invoice'}
                        />

                        {/* Account Selection */}
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
                            {errors.cuenta_id && <Text className="text-red-500 text-xs mt-1">{errors.cuenta_id}</Text>}
                        </View>

                        {/* Category Selection Grid - Reused for both income/expense */}
                        {type !== 'invoice' && (
                            <View>
                                <InputLabel>{t('finance.category')}</InputLabel>
                                <View className="flex-row flex-wrap gap-2">
                                    {gridCategories.map((gridCat) => (
                                        <Pressable
                                            key={gridCat.id}
                                            onPress={() => handleCategoryGridSelect(gridCat)}
                                            className={`w-[23%] aspect-square rounded-2xl border-2 ${
                                                form.custom_category_id === gridCat.id
                                                    ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500'
                                                    : 'bg-white dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                                            }`}
                                        >
                                            <View className="flex-1 items-center justify-center">
                                                <gridCat.icon 
                                                    size={24} 
                                                    color={form.custom_category_id === gridCat.id ? theme.primary600 : '#94a3b8'} 
                                                />
                                                <Text 
                                                    numberOfLines={1}
                                                    className={`text-[9px] font-bold mt-1 text-center w-full px-1 ${form.custom_category_id === gridCat.id ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}
                                                >
                                                    {gridCat.label}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>

                                {errors.categoria_id && <Text className="text-red-500 text-xs mt-1">{errors.categoria_id}</Text>}
                            </View>
                        )}

                        {/* Invoice Specific: Recurring Logic */}
                        {type === 'invoice' && (
                            <View className="bg-white dark:bg-secondary-900 p-5 rounded-3xl border border-secondary-100 dark:border-secondary-800 shadow-sm">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-secondary-900 dark:text-white font-bold text-sm">
                                            {t('finance.is_recurring')}
                                        </Text>
                                        <Text className="text-secondary-500 text-[11px] mt-0.5">
                                            {t('finance.recurring_hint')}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={form.is_recurring}
                                        onValueChange={(val) => setForm({ ...form, is_recurring: val })}
                                        trackColor={{ false: '#d1d5db', true: theme.primary500 }}
                                        thumbColor="white"
                                    />
                                </View>

                                {form.is_recurring && (
                                    <View className="mt-6 gap-5 border-t border-secondary-50 dark:border-secondary-800 pt-5">
                                        <Input
                                            label={t('finance.recurrence_day')}
                                            description={t('finance.payment_day_hint')}
                                            placeholder="1-31"
                                            keyboardType="numeric"
                                            value={form.recurrence_day}
                                            onChangeText={(text) => setForm({ ...form, recurrence_day: text })}
                                        />
                                        <View>
                                            <InputLabel>{t('finance.default_account')}</InputLabel>
                                            <View className="flex-row flex-wrap gap-2">
                                                {accounts?.map((acc) => (
                                                    <Pressable
                                                        key={acc.id}
                                                        onPress={() => setForm({ ...form, cuenta_predeterminada_id: acc.id })}
                                                        className={`px-4 py-2 rounded-xl border-2 flex-row items-center ${
                                                            form.cuenta_predeterminada_id === acc.id 
                                                                ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500' 
                                                                : 'bg-white dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                                                        }`}
                                                    >
                                                        <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: acc.color || theme.primary600 }} />
                                                        <Text className={`font-bold text-sm ${form.cuenta_predeterminada_id === acc.id ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-600'}`}>
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
                    </View>
                </ScrollView>

                {/* Footer Actions - Outside ScrollView for Design Parity */}
                <View className="flex-row gap-4 p-6 border-t border-secondary-50 dark:border-secondary-800 bg-white dark:bg-secondary-900">
                    <SecondaryButton 
                        onPress={onClose} 
                        className="flex-1 rounded-2xl"
                        size="lg"
                    >
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
            </View>
        </Modal>
    );
};
