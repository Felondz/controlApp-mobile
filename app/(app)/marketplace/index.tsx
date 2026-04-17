import React from 'react';
import { View, Text, ScrollView, Switch, useWindowDimensions } from 'react-native';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import { PuzzleIcon, CalculatorIcon } from '../../../src/shared/icons';
import { useAuthStore } from '../../../src/stores/authStore';

export default function MarketplaceScreen() {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const { user, toggleTool } = useAuthStore();
    const { width } = useWindowDimensions();
    
    // Balanced proportions for middle ground
    const gap = 12;
    const padding = 16;
    const cardWidth = (width - (padding * 2) - gap) / 2;

    const tools = [
        { 
            id: 'calculator', 
            title: t('tools.financial_calculator'), 
            desc: t('tools.financial_calculator_desc'), 
            icon: <CalculatorIcon size={20} color={theme.primary600} />, 
            enabled: user?.enabled_tools?.includes('calculator') || false
        },
    ];

    return (
        <ScrollView 
            className="flex-1 bg-secondary-50 dark:bg-secondary-950"
            contentContainerStyle={{ paddingHorizontal: padding, paddingTop: 4, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            {/* BALANCED HEADER */}
            <View className="mt-4 mb-6 flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                    <Text 
                        className="text-2xl md:text-3xl font-black tracking-tighter"
                        style={{ color: theme.primary600 }}
                    >
                        {t('marketplace.title')}
                    </Text>
                    <Text className="text-secondary-500 dark:text-secondary-400 font-medium text-base mt-1">
                        {t('marketplace.subtitle')}
                    </Text>
                </View>
                <View 
                    className="w-12 h-12 bg-white dark:bg-secondary-800 rounded-xl items-center justify-center border border-secondary-100 dark:border-secondary-700 shadow-sm"
                >
                    <PuzzleIcon size={24} color={theme.primary600} />
                </View>
            </View>

            {/* BALANCED GRID */}
            <View className="flex-row flex-wrap" style={{ gap: gap }}>
                {tools.map((tool) => (
                    <View
                        key={tool.id}
                        style={{ width: cardWidth }}
                        className="bg-white dark:bg-secondary-900 rounded-[24px] p-5 border border-secondary-200 dark:border-secondary-800 shadow-sm"
                    >
                        <View 
                            className="w-12 h-12 rounded-xl items-center justify-center mb-4"
                            style={{ backgroundColor: `${theme.primary600}10` }}
                        >
                            {tool.icon}
                        </View>
                        
                        <Text className="text-base md:text-base font-black text-secondary-900 dark:text-secondary-50 mb-1 leading-tight" numberOfLines={2}>
                            {tool.title}
                        </Text>
                        
                        <Text className="text-sm text-secondary-500 dark:text-secondary-400 leading-4 mb-4 flex-1" numberOfLines={3}>
                            {tool.desc}
                        </Text>

                        <View className="flex-row items-center justify-between pt-3 border-t border-secondary-50 dark:border-secondary-800">
                            <Text className="text-sm font-black uppercase tracking-widest text-secondary-400">
                                {tool.enabled ? t('common.active') : 'Off'}
                            </Text>
                            <Switch
                                value={tool.enabled}
                                onValueChange={() => toggleTool(tool.id)}
                                trackColor={{ false: isDark ? '#374151' : '#d1d5db', true: theme.primary600 }}
                                thumbColor="#fff"
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginRight: -6 }}
                            />
                        </View>
                    </View>
                ))}
            </View>

            {/* UPCOMING TOOLS FOOTER */}
            <View className="mt-8 p-6 rounded-[28px] border-2 border-dashed border-secondary-200 dark:border-secondary-800 items-center">
                <Text className="text-secondary-900 dark:text-secondary-100 font-bold text-center mb-1 text-base">
                    {t('marketplace.looking_for_more')}
                </Text>
                <Text className="text-secondary-500 dark:text-secondary-400 text-sm text-center leading-4 px-4 font-medium">
                    {t('marketplace.looking_for_more_desc')}
                </Text>
            </View>
        </ScrollView>
    );
}
