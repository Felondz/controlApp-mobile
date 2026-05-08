import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCreateCuenta } from '../../../hooks/graphql/useFinance';

// Components
import Modal from '../../../shared/components/Modal';
import Input from '../../../shared/components/Input';
import InputLabel from '../../../shared/components/InputLabel';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import { 
    PersonalFinanceIcon, 
    BriefcaseIcon, 
    HomeIcon,
    ArrowTrendingUpIcon,
    EllipsisHorizontalIcon,
    BanknotesIcon,
    WalletIcon,
} from '../../../shared/icons';
import { maskCurrency as currencyMask, parseToCents } from '../../../shared/currency';
import DatePicker from '../../../shared/components/inputs/DatePicker';

interface AccountModalProps {
    visible: boolean;
    onClose: () => void;
    proyectoId: string;
}

export const AccountModal = ({ visible, onClose, proyectoId }: AccountModalProps) => {
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    const { mutateAsync: createCuenta, isPending } = useCreateCuenta();

    const ACCOUNT_TYPES = useMemo(() => [
        { label: 'finance.type_efectivo', value: 'efectivo', icon: BanknotesIcon, color: '#10b981', hint: t('finance.info_efectivo') },
        { label: 'finance.type_ahorro', value: 'banco', icon: HomeIcon, color: '#3b82f6', hint: t('finance.info_banco') },
        { label: 'finance.type_credit_card', value: 'credito', icon: PersonalFinanceIcon, color: '#ef4444', hint: t('finance.info_credit_card') },
        { label: 'finance.type_prestamo', value: 'prestamo', icon: BriefcaseIcon, color: '#8b5cf6', hint: t('finance.info_prestamo') },
        { label: 'finance.type_inversion', value: 'inversion', icon: ArrowTrendingUpIcon, color: '#f59e0b', hint: t('finance.info_inversion') },
        { label: 'finance.type_other', value: 'otro', icon: EllipsisHorizontalIcon, color: '#64748b', hint: '' },
    ], [t]);

    const [form, setForm] = useState({
        nombre: '',
        tipo: 'banco',
        saldo_inicial: '',
        moneda: 'COP',
        banco: '',
        tasa_interes_anual: '',
        limite_credito: '',
        dia_corte: new Date().toISOString().split('T')[0],
        dia_pago: new Date().toISOString().split('T')[0],
        fecha_vencimiento: new Date().toISOString().split('T')[0],
        descripcion: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (visible) {
            setForm({
                nombre: '',
                tipo: 'banco',
                saldo_inicial: '',
                moneda: 'COP',
                banco: '',
                tasa_interes_anual: '',
                limite_credito: '',
                dia_corte: new Date().toISOString().split('T')[0],
                dia_pago: new Date().toISOString().split('T')[0],
                fecha_vencimiento: new Date().toISOString().split('T')[0],
                descripcion: '',
            });
            setErrors({});
        }
    }, [visible]);

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        if (!form.nombre) newErrors.nombre = t('common.required');
        if (!form.saldo_inicial && form.tipo !== 'prestamo') newErrors.saldo_inicial = t('common.required');

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createCuenta({
                proyecto_id: parseInt(proyectoId),
                nombre: form.nombre,
                tipo: form.tipo,
                saldo_inicial: parseToCents(form.saldo_inicial || '0', form.moneda),
                moneda: form.moneda,
                banco: form.banco,
                tasa_interes_anual: parseFloat(form.tasa_interes_anual) || null,
                limite_credito: parseToCents(form.limite_credito || '0', form.moneda),
                dia_corte: form.dia_corte,
                dia_pago: form.dia_pago,
                fecha_vencimiento: form.fecha_vencimiento,
                descripcion: form.descripcion,
            });
            onClose();
        } catch (error) {
            console.error('Error creating account:', error);
            Alert.alert(t('common.error'), t('finance.account_create_error'));
        }
    };

    const selectedType = ACCOUNT_TYPES.find(t => t.value === form.tipo);
    const headerColor = theme.primary600;

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title={t('finance.create_account')}
            headerBackgroundColor={headerColor}
            headerTextColor="white"
            scrollable={true}
        >
            <View className="p-6 gap-6">
                {/* Account Type Grid */}
                <View>
                    <InputLabel>{t('finance.account_type')}</InputLabel>
                    <View className="flex-row flex-wrap gap-2">
                        {ACCOUNT_TYPES.map((type) => (
                            <Pressable
                                key={type.value}
                                onPress={() => setForm({ ...form, tipo: type.value })}
                                className={`w-[23%] aspect-square rounded-2xl border-2 ${
                                    form.tipo === type.value 
                                        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500' 
                                        : 'bg-white dark:bg-secondary-900 border-secondary-100 dark:border-secondary-800'
                                }`}
                            >
                                <View className="flex-1 items-center justify-center">
                                    <type.icon 
                                        size={24} 
                                        color={form.tipo === type.value ? theme.primary600 : '#94a3b8'} 
                                    />
                                    <Text 
                                        numberOfLines={1}
                                        className={`text-[9px] font-bold mt-1 text-center w-full px-1 ${form.tipo === type.value ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}
                                    >
                                        {t(type.label)}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                    {selectedType?.hint ? (
                        <View className="mt-4 p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-100 dark:border-secondary-800">
                            <Text className="text-secondary-600 dark:text-secondary-400 text-[11px] leading-4 italic">
                                {selectedType.hint}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <Input
                    label={t('finance.account_name')}
                    placeholder={t('finance.account_name_placeholder')}
                    value={form.nombre}
                    onChangeText={(text) => setForm({ ...form, nombre: text })}
                    error={errors.nombre}
                    required
                />

                <Input
                    label={t('finance.initial_balance')}
                    description={t('finance.bank_balance_hint')}
                    placeholder="$ 0"
                    keyboardType="numeric"
                    value={form.saldo_inicial}
                    onChangeText={(text) => setForm({ ...form, saldo_inicial: currencyMask(text, form.moneda) })}
                    error={errors.saldo_inicial}
                    required={form.tipo !== 'prestamo'}
                    icon={WalletIcon}
                />

                {/* Dynamic Sections */}
                {form.tipo === 'credito' && (
                    <View className="gap-4 p-5 bg-secondary-50 dark:bg-secondary-900/40 rounded-3xl border border-secondary-200 dark:border-secondary-800">
                        <View className="flex-row items-center mb-1">
                            <PersonalFinanceIcon size={18} color={theme.primary600} />
                            <Text className="text-secondary-800 dark:text-secondary-300 font-black text-xs tracking-widest ml-2">
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
                                    onChangeText={(text) => setForm({ ...form, limite_credito: currencyMask(text, form.moneda) })}
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

                {form.tipo === 'prestamo' && (
                    <View className="gap-4 p-5 bg-secondary-50 dark:bg-secondary-900/40 rounded-3xl border border-secondary-200 dark:border-secondary-800">
                        <View className="flex-row items-center mb-1">
                            <BriefcaseIcon size={18} color={theme.primary600} />
                            <Text className="text-secondary-800 dark:text-secondary-300 font-black text-xs tracking-widest ml-2">
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
                    </View>
                )}

                {form.tipo === 'inversion' && (
                    <View className="gap-4 p-5 bg-secondary-50 dark:bg-secondary-900/40 rounded-3xl border border-secondary-200 dark:border-secondary-800">
                        <View className="flex-row items-center mb-1">
                            <ArrowTrendingUpIcon size={18} color={theme.primary600} />
                            <Text className="text-secondary-800 dark:text-secondary-300 font-black text-xs tracking-widest ml-2">
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

                <Input
                    label={t('common.description')}
                    placeholder={t('common.optional')}
                    multiline
                    numberOfLines={3}
                    value={form.descripcion}
                    onChangeText={(text) => setForm({ ...form, descripcion: text })}
                />

                {/* Footer Actions */}
                <View className="flex-row gap-4 mt-2">
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

                {/* Extra Space at the bottom to force scrollability */}
                <View style={{ height: 100 }} />
            </View>
        </Modal>
    );
};
