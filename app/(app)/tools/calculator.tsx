import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Share } from 'react-native';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import {
    CalculatorIcon,
    ChevronLeftIcon,
    ArrowDownTrayIcon,
    ChartBarIcon,
    VariableIcon,
    ArrowPathIcon,
    CheckIcon,
    CurrencyDollarIcon
} from '../../../src/shared/icons';import { useRouter } from 'expo-router';
import PrimaryButton from '../../../src/shared/components/PrimaryButton';
import Input from '../../../src/shared/components/Input';

type CalcMode = 'basic' | 'advanced';

export default function FinancialCalculatorScreen() {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();

    const [mode, setMode] = useState<CalcMode>('basic');
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState('');
    const [time, setTime] = useState('');
    const [compoundFrequency, setCompoundFrequency] = useState('12'); // Monthly default

    const [result, setResult] = useState<{
        total: number;
        interest: number;
        principal: number;
        monthlyPayment?: number;
    } | null>(null);

    const calculate = () => {
        const p = parseFloat(amount.replace(/[^0-9.]/g, ''));
        const r = parseFloat(rate) / 100;
        const t_yrs = parseFloat(time);

        if (isNaN(p) || isNaN(r) || isNaN(t_yrs)) return;

        setLoading(true);
        
        // Simulate processing like web version
        setTimeout(() => {
            if (mode === 'basic') {
                const interest = p * r * t_yrs;
                setResult({
                    total: p + interest,
                    interest: interest,
                    principal: p
                });
            } else {
                // Compound Interest: A = P(1 + r/n)^(nt)
                const n = parseFloat(compoundFrequency);
                const total = p * Math.pow((1 + r/n), (n * t_yrs));
                setResult({
                    total: total,
                    interest: total - p,
                    principal: p,
                    monthlyPayment: total / (t_yrs * 12)
                });
            }
            setLoading(false);
        }, 600);
    };

    const handleExport = async () => {
        if (!result) return;
        const message = `ControlApp - Reporte Financiero\n\nPrincipal: $${result.principal.toLocaleString()}\nIntereses: $${result.interest.toLocaleString()}\nTotal: $${result.total.toLocaleString()}`;
        await Share.share({ message });
    };

    const clear = () => {
        setAmount('');
        setRate('');
        setTime('');
        setResult(null);
    };

    const ModeSelector = () => (
        <View className="flex-row bg-secondary-100 dark:bg-secondary-800 rounded-2xl p-1 mb-8">
            {(['basic', 'advanced'] as CalcMode[]).map((m) => (
                <Pressable
                    key={m}
                    onPress={() => { setMode(m); setResult(null); }}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${mode === m ? 'bg-white dark:bg-secondary-700 shadow-sm' : ''}`}
                >
                    <Text className={`font-black uppercase tracking-widest text-[10px] ${mode === m ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500'}`}>
                        {m === 'basic' ? t('common.basic', 'Básico') : t('common.advanced', 'Avanzado')}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row items-center justify-between mb-8 mt-4">
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 rounded-2xl bg-primary-500/10 items-center justify-center mr-4">
                            <CalculatorIcon size={28} color={theme.primary600} />
                        </View>
                        <View>
                            <Text className="text-2xl font-black text-secondary-900 dark:text-white tracking-tighter">
                                {t('tools.financial_calculator')}
                            </Text>
                            <Text className="text-secondary-500 text-xs font-bold uppercase tracking-widest">
                                Pro Analysis
                            </Text>
                        </View>
                    </View>
                    {result && (
                        <Pressable onPress={handleExport} className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-800 items-center justify-center">
                            <ArrowDownTrayIcon size={20} color={theme.primary600} />
                        </Pressable>
                    )}
                </View>

                <ModeSelector />

                <View className="bg-white dark:bg-secondary-900 rounded-[32px] p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm mb-6">
                    <View className="gap-6">
                        <Input 
                            label={t('finance.amount', 'Capital Inicial')} 
                            placeholder="0.00" 
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            leftIcon={<CurrencyDollarIcon size={20} color={theme.primary600} />}
                        />
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Input 
                                    label={t('finance.rate', 'Tasa Anual %')} 
                                    placeholder="12" 
                                    keyboardType="numeric"
                                    value={rate}
                                    onChangeText={setRate}
                                />
                            </View>
                            <View className="flex-1">
                                <Input 
                                    label={t('finance.time', 'Años')} 
                                    placeholder="1" 
                                    keyboardType="numeric"
                                    value={time}
                                    onChangeText={setTime}
                                />
                            </View>
                        </View>

                        {mode === 'advanced' && (
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-3 ml-1">Frecuencia de Capitalización</Text>
                                <View className="flex-row gap-2">
                                    {[
                                        { label: 'Mensual', val: '12' },
                                        { label: 'Anual', val: '1' }
                                    ].map(item => (
                                        <Pressable 
                                            key={item.val}
                                            onPress={() => setCompoundFrequency(item.val)}
                                            className={`flex-1 py-3 rounded-xl border-2 items-center ${compoundFrequency === item.val ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-secondary-100 dark:border-secondary-800'}`}
                                        >
                                            <Text className={`font-bold text-xs ${compoundFrequency === item.val ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}>{item.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="flex-row gap-3 mt-10">
                        <Pressable 
                            onPress={clear}
                            className="w-14 h-14 rounded-2xl bg-secondary-50 dark:bg-secondary-800 items-center justify-center active:scale-95"
                        >
                            <ArrowPathIcon size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </Pressable>
                        <View className="flex-1">
                            <PrimaryButton onPress={calculate} loading={loading} size="xl">
                                {t('common.calculate', 'Calcular')}
                            </PrimaryButton>
                        </View>
                    </View>
                </View>

                {result && !loading && (
                    <View className="gap-4">
                        {/* Main Result Card */}
                        <View className="bg-primary-600 rounded-[32px] p-8 shadow-xl shadow-primary-500/30">
                            <Text className="text-white/60 font-black uppercase tracking-[2px] text-[10px] mb-2 text-center">Valor Final Estimado</Text>
                            <Text className="text-4xl font-black text-white text-center tracking-tighter">
                                ${result.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Text>
                            {result.monthlyPayment && (
                                <View className="mt-4 pt-4 border-t border-white/10 items-center">
                                    <Text className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1">Pago Mensual Sugerido</Text>
                                    <Text className="text-xl font-black text-white">${result.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                                </View>
                            )}
                        </View>

                        {/* Breakdown Card */}
                        <View className="bg-white dark:bg-secondary-900 rounded-[32px] p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm">
                            <View className="flex-row items-center mb-6">
                                <ChartBarIcon size={20} color={theme.primary600} />
                                <Text className="ml-2 font-black text-secondary-900 dark:text-white uppercase tracking-widest text-xs">Desglose del Capital</Text>
                            </View>
                            
                            <View className="gap-4">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-secondary-300 mr-2" />
                                        <Text className="text-secondary-500 font-bold">Capital Base</Text>
                                    </View>
                                    <Text className="text-secondary-900 dark:text-white font-black">${result.principal.toLocaleString()}</Text>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-primary-500 mr-2" />
                                        <Text className="text-secondary-500 font-bold">Intereses Ganados</Text>
                                    </View>
                                    <Text className="text-primary-600 dark:text-primary-400 font-black">+ ${result.interest.toLocaleString()}</Text>
                                </View>
                            </View>

                            {/* Simple Visual Bar */}
                            <View className="h-3 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full mt-6 overflow-hidden flex-row">
                                <View style={{ width: `${(result.principal / result.total) * 100}%` }} className="h-full bg-secondary-300" />
                                <View style={{ width: `${(result.interest / result.total) * 100}%` }} className="h-full bg-primary-500" />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
