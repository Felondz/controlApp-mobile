import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useCuentas } from '../../../../src/hooks/graphql/useFinance';
import { useTranslate, useAppTheme } from '../../../../src/shared/hooks';
import { formatCurrency } from '../../../../src/shared/currency';

export default function AccountDetailScreen() {
    const { activeProject } = useProjectStore();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    
    const { data: cuentas, isLoading } = useCuentas(activeProject?.id || 0);

    if (isLoading) {
        return <ActivityIndicator size="large" color={theme.primary600} />;
    }

    const cuenta = cuentas?.find(c => c.id === id);

    if (!cuenta) {
        return <View className="flex-1 items-center justify-center"><Text>Cuenta no encontrada</Text></View>;
    }

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <Stack.Screen 
                options={{
                    headerShown: true,
                    title: cuenta.nombre,
                    headerStyle: { backgroundColor: theme.primary600 },
                    headerTintColor: 'white',
                }} 
            />
            <ScrollView className="p-6">
                <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-sm mb-6">
                    <Text className="text-secondary-400 text-xs font-black uppercase tracking-widest mb-1">{cuenta.tipo}</Text>
                    <Text className="text-3xl font-black text-secondary-900 dark:text-white mb-2">{formatCurrency(cuenta.saldo_actual)}</Text>
                    <Text className="text-secondary-500 dark:text-secondary-400">{cuenta.banco}</Text>
                </View>

                {/* More details like transactions history would go here */}
                <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-sm">
                    <Text className="text-lg font-black text-secondary-900 dark:text-white mb-4">Información</Text>
                    <View className="gap-4">
                        <View className="flex-row justify-between">
                            <Text className="text-secondary-500">Saldo Inicial</Text>
                            <Text className="font-bold text-secondary-900 dark:text-white">{formatCurrency(cuenta.saldo_inicial)}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-secondary-500">Moneda</Text>
                            <Text className="font-bold text-secondary-900 dark:text-white">{cuenta.moneda}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-secondary-500">Estado</Text>
                            <Text className="font-bold text-secondary-900 dark:text-white">{cuenta.estado}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
