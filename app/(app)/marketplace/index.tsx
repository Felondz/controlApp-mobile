import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslate } from '../../../src/shared/hooks';
import { PuzzleIcon, CalculatorIcon, PackageIcon, FactoryIcon } from '../../../src/shared/icons';
import { getTheme } from '../../../src/shared/themes';
import { useSettingsStore } from '../../../src/stores/settingsStore';

export default function MarketplaceScreen() {
    const { t } = useTranslate();
    const { theme: themeName, isDark } = useSettingsStore();
    const theme = getTheme(themeName);

    const modules = [
        { id: 'finance', title: 'Finanzas', desc: 'Gestión de flujos y cuentas', icon: CalculatorIcon, color: '#10b981' },
        { id: 'inventory', title: 'Inventario', desc: 'Control de stock y activos', icon: PackageIcon, color: '#6366f1' },
        { id: 'operations', title: 'Operaciones', desc: 'Procesos y optimización', icon: FactoryIcon, color: '#f59e0b' },
    ];

    return (
        <ScrollView className="flex-1 bg-secondary-50 dark:bg-secondary-950 p-4">
            <View className="mb-8 mt-2 px-1">
                <Text className="text-2xl font-black text-secondary-900 dark:text-secondary-100 tracking-tight">
                    {t('modules.marketplace.title', 'Mercado de Módulos')}
                </Text>
                <Text className="text-secondary-500 dark:text-secondary-400 font-medium">
                    {t('modules.marketplace.subtitle', 'Potencia tus proyectos con herramientas especializadas.')}
                </Text>
            </View>

            <View className="gap-4">
                {modules.map((mod) => (
                    <TouchableOpacity
                        key={mod.id}
                        activeOpacity={0.7}
                        className="bg-white dark:bg-secondary-800 rounded-3xl p-5 border border-secondary-200 dark:border-secondary-700 shadow-sm flex-row items-center"
                    >
                        <View className="w-14 h-14 rounded-2xl bg-secondary-50 dark:bg-secondary-900 items-center justify-center mr-4">
                            <mod.icon size={28} color={mod.color} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                                {mod.title}
                            </Text>
                            <Text className="text-sm text-secondary-500 dark:text-secondary-400">
                                {mod.desc}
                            </Text>
                        </View>
                        <View className="px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30">
                            <Text className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase">Ver</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}
