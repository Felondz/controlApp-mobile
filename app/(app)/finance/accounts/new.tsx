import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslate, useAppTheme } from '../../../../src/shared/hooks';
import { useProjectStore } from '../../../../src/stores/projectStore';
import { useCreateCuenta } from '../../../../src/hooks/graphql/useFinance';

// Components
import { Input, PrimaryButton, SecondaryButton } from '../../../../src/shared/components';
import { WalletIcon, BanknotesIcon, CreditCardIcon } from '../../../../src/shared/icons';

const ACCOUNT_TYPES = [
    { label: 'Efectivo / Billetera', value: 'efectivo', icon: WalletIcon },
    { label: 'Cuenta Bancaria', value: 'banco', icon: BanknotesIcon },
    { label: 'Tarjeta de Crédito', value: 'credit_card', icon: CreditCardIcon },
    { label: 'Inversión', value: 'inversion', icon: BanknotesIcon },
];

export default function NewAccountScreen() {
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    const { mutateAsync: createCuenta, isPending } = useCreateCuenta();

    const [form, setForm] = useState({
        nombre: '',
        tipo: 'efectivo',
        banco: '',
        saldo_inicial: '',
        moneda: 'COP',
        descripcion: '',
        color: theme.primary600,
        tasa_interes_anual: '',
        limite_credito: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSave = async () => {
        if (!activeProject) return;
        
        // Validation
        const newErrors: Record<string, string> = {};
        if (!form.nombre) newErrors.nombre = t('common.required', 'Campo requerido');
        if (!form.saldo_inicial) newErrors.saldo_inicial = t('common.required', 'Campo requerido');
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createCuenta({
                proyecto_id: activeProject.id,
                nombre: form.nombre,
                tipo: form.tipo,
                saldo_inicial: parseInt(form.saldo_inicial),
                banco: form.banco || undefined,
                moneda: form.moneda,
                descripcion: form.descripcion || undefined,
                color: form.color,
                tasa_interes_anual: form.tasa_interes_anual ? parseFloat(form.tasa_interes_anual) : undefined,
                limite_credito: form.limite_credito ? parseInt(form.limite_credito) : undefined,
            });
            
            router.back();
        } catch (error) {
            console.error('Error creating account:', error);
            Alert.alert(t('common.error'), t('finance.account_create_error', 'No se pudo crear la cuenta'));
        }
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <Stack.Screen 
                options={{
                    headerShown: true,
                    title: t('finance.create_account', 'Nueva Cuenta'),
                    headerStyle: { backgroundColor: theme.primary600 },
                    headerTintColor: 'white',
                    headerTitleStyle: { fontWeight: 'bold' },
                }} 
            />

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView 
                    className="flex-1 p-6"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="gap-6 pb-20">
                        <Input
                            label={t('finance.account_name', 'Nombre de la Cuenta')}
                            placeholder="Ej. Nómina Banco"
                            value={form.nombre}
                            onChangeText={(text) => setForm({ ...form, nombre: text })}
                            error={errors.nombre}
                            required
                        />

                        <View>
                            <Text className="text-secondary-400 dark:text-secondary-500 text-xs font-black uppercase tracking-widest mb-3">
                                {t('finance.account_type', 'Tipo de Cuenta')}
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {ACCOUNT_TYPES.map((type) => (
                                    <PrimaryButton
                                        key={type.value}
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

                        {(form.tipo === 'banco' || form.tipo === 'credit_card') && (
                            <Input
                                label={t('finance.bank_name', 'Banco')}
                                placeholder="Ej. Bancolombia"
                                value={form.banco}
                                onChangeText={(text) => setForm({ ...form, banco: text })}
                            />
                        )}

                        <Input
                            label={t('finance.initial_balance', 'Saldo Inicial')}
                            placeholder="0"
                            keyboardType="numeric"
                            value={form.saldo_inicial}
                            onChangeText={(text) => setForm({ ...form, saldo_inicial: text })}
                            error={errors.saldo_inicial}
                            required
                        />

                        {form.tipo === 'credit_card' && (
                            <Input
                                label={t('finance.credit_limit', 'Límite de Crédito')}
                                placeholder="Ej. 5000000"
                                keyboardType="numeric"
                                value={form.limite_credito}
                                onChangeText={(text) => setForm({ ...form, limite_credito: text })}
                            />
                        )}

                        <Input
                            label={t('common.description', 'Descripción')}
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
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
