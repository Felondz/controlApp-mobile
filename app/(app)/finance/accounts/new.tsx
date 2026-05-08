import React, { useState, useMemo } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Alert, Switch, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslate, useAppTheme } from '../../../../src/shared/hooks';
import { useProjectStore } from '../../../../src/stores/projectStore';
import { useCreateCuenta, useCuentas } from '../../../../src/hooks/graphql/useFinance';

// Components
import { Input, PrimaryButton, SecondaryButton, Modal, ThemedScrollView, DatePicker } from '../../../../src/shared/components';
import { WalletIcon, CurrencyDollarIcon, PersonalFinanceIcon, BriefcaseIcon, HomeIcon, CheckIcon } from '../../../../src/shared/icons';
import { maskCurrency, parseToCents } from '../../../../src/shared/currency';

const CURRENCIES = [
    { label: 'COP - Peso Colombiano', value: 'COP' },
    { label: 'USD - Dólar Estadounidense', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
];

const PAYROLL_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function NewAccountScreen() {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    const { mutateAsync: createCuenta, isPending } = useCreateCuenta();
    const { data: accounts = [] } = useCuentas(activeProject?.id || 0);

    const ACCOUNT_TYPES = useMemo(() => [
        { label: t('finance.type_efectivo'), value: 'efectivo', icon: WalletIcon },
        { label: t('finance.type_ahorro'), value: 'banco', icon: HomeIcon },
        { label: t('finance.type_banco'), value: 'banco', icon: CurrencyDollarIcon },
        { label: t('finance.type_credit_card'), value: 'credito', icon: PersonalFinanceIcon },
        { label: t('finance.type_prestamo'), value: 'prestamo', icon: BriefcaseIcon },
        { label: t('finance.type_inversion'), value: 'inversion', icon: CurrencyDollarIcon },
    ], [t]);

    const [form, setForm] = useState({
        nombre: '',
        tipo: 'efectivo',
        banco: '',
        saldo_inicial: '',
        moneda: activeProject?.moneda_default || 'COP',
        descripcion: '',
        color: theme.primary600,
        is_payroll: false,
        // Payroll specific
        dia_nomina: [] as number[],
        valor_nomina: '',
        // Credit Card / Loan fields
        tasa_interes_anual: '',
        limite_credito: '',
        dia_corte: new Date().toISOString().split('T')[0],
        dia_pago: new Date().toISOString().split('T')[0],
        fecha_vencimiento: new Date().toISOString().split('T')[0],
        // Loan disbursement
        monto_desembolsado: '',
        cuenta_destino_id: null as number | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);

    const handleSave = async () => {
        if (!activeProject) return;
        
        // Validation
        const newErrors: Record<string, string> = {};
        if (!form.nombre) newErrors.nombre = t('validation.required');
        if (!form.saldo_inicial && form.tipo !== 'prestamo') newErrors.saldo_inicial = t('validation.required');
        
        if (form.tipo === 'credito') {
            if (!form.dia_corte) newErrors.dia_corte = t('validation.required');
            if (!form.dia_pago) newErrors.dia_pago = t('validation.required');
        }

        if (form.is_payroll && form.dia_nomina.length === 0) {
            newErrors.dia_nomina = t('validation.required');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createCuenta({
                proyecto_id: activeProject.id,
                nombre: form.nombre,
                tipo: form.tipo,
                saldo_inicial: parseToCents(form.saldo_inicial, form.moneda),
                banco: form.banco,
                moneda: form.moneda,
                descripcion: form.descripcion,
                dia_pago: form.dia_pago ? parseInt(form.dia_pago) : undefined,
                dia_corte: form.dia_corte ? parseInt(form.dia_corte) : undefined,
                limite_credito: form.limite_credito ? parseToCents(form.limite_credito, form.moneda) : undefined,
                tasa_interes_anual: form.tasa_interes_anual ? parseFloat(form.tasa_interes_anual) : undefined,
            });
            
            router.back();
        } catch (error) {
            console.error('Error creating account:', error);
            Alert.alert(t('common.error'), t('finance.account_create_error', 'No se pudo crear la cuenta'));
        }
    };

    const togglePayrollDay = (day: number) => {
        setForm(prev => {
            const current = prev.dia_nomina;
            if (current.includes(day)) {
                return { ...prev, dia_nomina: current.filter(d => d !== day) };
            }
            if (current.length >= 4) return prev; // Limit 4 days
            return { ...prev, dia_nomina: [...current, day].sort((a, b) => a - b) };
        });
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <Stack.Screen 
                options={{
                    headerShown: true,
                    title: t('finance.create_account'),
                    headerStyle: { backgroundColor: theme.primary600 },
                    headerTintColor: 'white',
                    headerTitleStyle: { fontWeight: 'bold' },
                }} 
            />

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                className="flex-1"
            >
                <ThemedScrollView 
                    className="flex-1 px-6"
                    contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="gap-6 pb-20">
                        {/* Name & Type - Always Visible */}
                        <View className="gap-4">
                            <Input
                                label={t('finance.account_name')}
                                placeholder="Ej. Nómina Principal"
                                value={form.nombre}
                                onChangeText={(text) => setForm({ ...form, nombre: text })}
                                error={errors.nombre}
                                required
                            />

                            <View>
                                <Text className="text-secondary-400 dark:text-secondary-500 text-xs font-black tracking-widest mb-3">
                                    {t('finance.account_type')}
                                </Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {ACCOUNT_TYPES.map((type, idx) => (
                                        <PrimaryButton
                                            key={`${type.value}-${idx}`}
                                            onPress={() => setForm({ ...form, tipo: type.value })}
                                            variant={form.tipo === type.value ? 'filled' : 'outline'}
                                            className="flex-1 min-w-[140px]"
                                            size="md"
                                        >
                                            <type.icon size={18} color={form.tipo === type.value ? 'white' : theme.primary600} />
                                            <Text className={`ml-2 font-bold ${form.tipo === type.value ? 'text-white' : 'text-primary-600'}`}>
                                                {type.label}
                                            </Text>
                                        </PrimaryButton>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Common Financial Fields */}
                        <View className="gap-4">
                            <Pressable onPress={() => setShowCurrencyModal(true)}>
                                <View pointerEvents="none">
                                    <Input
                                        label={t('finance.currency')}
                                        value={form.moneda}
                                        editable={false}
                                    />
                                </View>
                            </Pressable>

                            {(form.tipo !== 'efectivo' && form.tipo !== 'inversion') && (
                                <Input
                                    label={t('finance.bank_name')}
                                    placeholder="Ej. Bancolombia"
                                    value={form.banco}
                                    onChangeText={(text) => setForm({ ...form, banco: text })}
                                />
                            )}

                            <Input
                                label={form.tipo === 'credito' ? t('finance.current_debt', 'Deuda Actual') : t('finance.initial_balance')}
                                placeholder="$ 0"
                                keyboardType="numeric"
                                value={form.saldo_inicial}
                                onChangeText={(text) => setForm({ ...form, saldo_inicial: maskCurrency(text, form.moneda) })}
                                error={errors.saldo_inicial}
                                required={form.tipo !== 'prestamo'}
                            />
                        </View>

                        {/* Dynamic Section: Credit Card */}
                        {form.tipo === 'credito' && (
                            <View className="gap-4 p-5 bg-danger-50/50 dark:bg-danger-950/20 rounded-3xl border border-danger-100 dark:border-danger-900">
                                <View className="flex-row items-center mb-1">
                                    <PersonalFinanceIcon size={18} color={theme.primary600} />
                                    <Text className="text-danger-800 dark:text-danger-300 font-black text-xs tracking-widest ml-2">
                                        {t('finance.credit_card_details', 'DETALLES DE TARJETA').toUpperCase()}
                                    </Text>
                                </View>
                                
                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <Input
                                            label={t('finance.credit_limit', 'Límite de Crédito')}
                                            placeholder="$ 0"
                                            keyboardType="numeric"
                                            value={form.limite_credito}
                                            onChangeText={(text) => setForm({ ...form, limite_credito: maskCurrency(text, form.moneda) })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Input
                                            label={t('finance.interest_rate', 'Tasa Mensual %')}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                            value={form.tasa_interes_anual}
                                            onChangeText={(text) => setForm({ ...form, tasa_interes_anual: text })}
                                        />
                                    </View>
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <DatePicker
                                            label={t('finance.cutoff_date', 'Fecha de Corte')}
                                            value={form.dia_corte}
                                            onChange={(date) => setForm({ ...form, dia_corte: date })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <DatePicker
                                            label={t('finance.payment_date', 'Fecha de Pago')}
                                            value={form.dia_pago}
                                            onChange={(date) => setForm({ ...form, dia_pago: date })}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Dynamic Section: Loan */}
                        {form.tipo === 'prestamo' && (
                            <View className="gap-4 p-5 bg-primary-50/50 dark:bg-primary-950/20 rounded-3xl border border-primary-100 dark:border-primary-900">
                                <View className="flex-row items-center mb-1">
                                    <BriefcaseIcon size={18} color={theme.primary600} />
                                    <Text className="text-primary-800 dark:text-primary-300 font-black text-xs tracking-widest ml-2">
                                        {t('finance.loan_details', 'DETALLES DEL PRÉSTAMO').toUpperCase()}
                                    </Text>
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <Input
                                            label={t('finance.interest_rate', 'Tasa Anual %')}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                            value={form.tasa_interes_anual}
                                            onChangeText={(text) => setForm({ ...form, tasa_interes_anual: text })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <DatePicker
                                            label={t('finance.payment_date', 'Fecha de Pago')}
                                            value={form.dia_pago}
                                            onChange={(date) => setForm({ ...form, dia_pago: date })}
                                        />
                                    </View>
                                </View>

                                <DatePicker
                                    label={t('finance.loan_end_date', 'Fecha Final del Crédito')}
                                    value={form.fecha_vencimiento}
                                    onChange={(date) => setForm({ ...form, fecha_vencimiento: date })}
                                />

                                <View className="h-[1px] bg-primary-100 dark:bg-primary-900 my-2" />
                                <Text className="text-primary-800 dark:text-primary-300 font-bold text-xs mb-1">
                                    {t('finance.disbursement', 'DESEMBOLSO INICIAL')}
                                </Text>
                                <Input
                                    label={t('finance.disbursement_amount', 'Monto Desembolsado')}
                                    placeholder="$ 0"
                                    keyboardType="numeric"
                                    value={form.monto_desembolsado}
                                    onChangeText={(text) => setForm({ ...form, monto_desembolsado: maskCurrency(text, form.moneda) })}
                                />
                                <View>
                                    <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black mb-2">
                                        {t('finance.target_account', 'CUENTA DESTINO')}
                                    </Text>
                                    <ThemedScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                        {accounts.map((acc: any) => (
                                            <PrimaryButton
                                                key={acc.id}
                                                onPress={() => setForm({ ...form, cuenta_destino_id: acc.id })}
                                                variant={form.cuenta_destino_id === acc.id ? 'filled' : 'outline'}
                                                size="sm"
                                                style={form.cuenta_destino_id === acc.id ? { backgroundColor: acc.color || theme.primary600 } : {}}
                                            >
                                                <Text className={form.cuenta_destino_id === acc.id ? 'text-white font-bold text-xs' : 'text-secondary-600 font-bold text-xs'}>
                                                    {acc.nombre}
                                                </Text>
                                            </PrimaryButton>
                                        ))}
                                    </ThemedScrollView>
                                </View>
                            </View>
                        )}

                        {/* Dynamic Section: Investment */}
                        {form.tipo === 'inversion' && (
                            <View className="gap-4 p-5 bg-success-50/50 dark:bg-success-950/20 rounded-3xl border border-success-100 dark:border-success-900">
                                <View className="flex-row items-center mb-1">
                                    <BriefcaseIcon size={18} color={theme.primary600} />
                                    <Text className="text-success-800 dark:text-success-300 font-black text-xs tracking-widest ml-2">
                                        {t('finance.investment_details', 'DETALLES DE INVERSIÓN').toUpperCase()}
                                    </Text>
                                </View>

                                <Input
                                    label={t('finance.interest_rate', 'Rendimiento Anual %')}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={form.tasa_interes_anual}
                                    onChangeText={(text) => setForm({ ...form, tasa_interes_anual: text })}
                                />

                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <DatePicker
                                            label={t('finance.cutoff_date', 'Fecha de Corte')}
                                            value={form.dia_corte}
                                            onChange={(date) => setForm({ ...form, dia_corte: date })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <DatePicker
                                            label={t('finance.maturity_date', 'Fecha de Vencimiento')}
                                            value={form.fecha_vencimiento}
                                            onChange={(date) => setForm({ ...form, fecha_vencimiento: date })}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Payroll Section - Only for Bank/Savings */}
                        {(form.tipo === 'banco' || form.tipo === 'ahorro') && (
                            <View className="gap-4">
                                <View className="flex-row items-center justify-between p-4 bg-secondary-100/50 dark:bg-secondary-800/50 rounded-2xl border border-secondary-200 dark:border-secondary-700">
                                    <View>
                                        <Text className="text-secondary-900 dark:text-white font-bold">
                                            {t('finance.is_payroll')}
                                        </Text>
                                        <Text className="text-secondary-500 text-xs font-medium">
                                            {t('finance.is_payroll_desc')}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={form.is_payroll}
                                        onValueChange={(val) => setForm({ ...form, is_payroll: val })}
                                        trackColor={{ false: '#d1d5db', true: theme.primary300 }}
                                        thumbColor={form.is_payroll ? theme.primary600 : '#f4f3f4'}
                                    />
                                </View>

                                {form.is_payroll && (
                                    <View className="gap-4 p-5 bg-primary-50/50 dark:bg-primary-950/20 rounded-3xl border border-primary-100 dark:border-primary-900">
                                        <Text className="text-primary-800 dark:text-primary-300 font-bold text-xs mb-1">
                                            {t('finance.payroll_days')}
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {PAYROLL_DAYS.map(day => (
                                                <Pressable
                                                    key={day}
                                                    onPress={() => togglePayrollDay(day)}
                                                    className={`w-9 h-9 rounded-lg items-center justify-center border ${
                                                        form.dia_nomina.includes(day)
                                                            ? 'bg-primary-600 border-primary-600'
                                                            : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700'
                                                    }`}
                                                >
                                                    <Text className={`font-bold text-xs ${form.dia_nomina.includes(day) ? 'text-white' : 'text-secondary-600 dark:text-secondary-400'}`}>
                                                        {day}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                        {errors.dia_nomina && <Text className="text-danger-500 text-[10px] mt-1">{errors.dia_nomina}</Text>}
                                        <Input
                                            label={t('finance.payroll_value')}
                                            placeholder="$ 0"
                                            keyboardType="numeric"
                                            value={form.valor_nomina}
                                            onChangeText={(text) => setForm({ ...form, valor_nomina: maskCurrency(text, form.moneda) })}
                                        />
                                    </View>
                                )}
                            </View>
                        )}

                        <Input
                            label={t('common.description')}
                            placeholder="Opcional..."
                            multiline
                            numberOfLines={3}
                            value={form.descripcion}
                            onChangeText={(text) => setForm({ ...form, descripcion: text })}
                        />

                        <View className="flex-row gap-4 mt-4">
                            <SecondaryButton 
                                onPress={() => router.back()}
                                className="flex-1"
                            >
                                {t('common.cancel')}
                            </SecondaryButton>
                            <PrimaryButton 
                                onPress={handleSave}
                                loading={isPending}
                                className="flex-1"
                            >
                                {t('common.save')}
                            </PrimaryButton>
                        </View>
                    </View>
                </ThemedScrollView>
            </KeyboardAvoidingView>

            {/* Currency Selection Modal */}
            <Modal
                visible={showCurrencyModal}
                onClose={() => setShowCurrencyModal(false)}
                title={t('finance.currency_select')}
            >
                <View className="p-2">
                    {CURRENCIES.map((currency) => (
                        <Pressable
                            key={currency.value}
                            onPress={() => {
                                setForm({ ...form, moneda: currency.value });
                                setShowCurrencyModal(false);
                            }}
                            className={`flex-row items-center justify-between p-4 m-1 rounded-2xl active:bg-secondary-100 dark:active:bg-secondary-800 ${
                                form.moneda === currency.value ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                            }`}
                        >
                            <Text className={`font-bold ${form.moneda === currency.value ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-700 dark:text-secondary-200'}`}>
                                {currency.label}
                            </Text>
                            {form.moneda === currency.value && <CheckIcon size={20} color={theme.primary600} />}
                        </Pressable>
                    ))}
                </View>
            </Modal>
        </View>
    );
}
