import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Alert, ScrollView, Pressable } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCreateCuenta } from '../../../hooks/graphql/useFinance';
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
    WalletIcon
} from '../../../shared/icons';
import { maskCurrency, parseToCents } from '../../../shared/currency';

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
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (visible) {
            setForm({
                nombre: '',
                tipo: 'banco',
                saldo_inicial: '',
                moneda: 'COP',
            });
            setErrors({});
        }
    }, [visible]);

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        if (!form.nombre) newErrors.nombre = t('common.required');
        if (!form.saldo_inicial) newErrors.saldo_inicial = t('common.required');

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createCuenta({
                proyecto_id: parseInt(proyectoId),
                nombre: form.nombre,
                tipo: form.tipo,
                saldo_inicial: parseToCents(form.saldo_inicial, form.moneda),
                moneda: form.moneda,
            });
            onClose();
        } catch (error) {
            console.error('Error creating account:', error);
            Alert.alert(t('common.error'), t('finance.account_create_error'));
        }
    };

    const selectedType = ACCOUNT_TYPES.find(t => t.value === form.tipo);
    const selectedTypeColor = selectedType?.color || theme.primary600;

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title={t('finance.create_account')}
            headerBackgroundColor={selectedTypeColor}
            headerTextColor="white"
        >
            <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
                <View className="gap-6 pb-10">
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
                            <View className="mt-4 p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-800/50">
                                <Text className="text-primary-700 dark:text-primary-400 text-[11px] leading-4 italic">
                                    {selectedType.hint}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <Input
                        label={t('finance.account_name')}
                        description={t('finance.account_name_hint')}
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
                        onChangeText={(text) => setForm({ ...form, saldo_inicial: maskCurrency(text, form.moneda) })}
                        error={errors.saldo_inicial}
                        required
                        icon={WalletIcon}
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
                            style={{ backgroundColor: selectedTypeColor }}
                        >
                            {t('common.save')}
                        </PrimaryButton>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    );
};
