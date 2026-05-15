import React, { useState, useEffect } from 'react';
import { View, Text, InteractionManager } from 'react-native';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import { SparklesIcon } from '../../../src/shared/icons';

export default function AiChatScreen() {
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => setIsReady(true));
        return () => task.cancel();
    }, []);

    if (!isReady) return null;

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950 items-center justify-center p-8">
            <View className="w-24 h-24 rounded-[32px] bg-primary-50 dark:bg-primary-900/20 items-center justify-center mb-8">
                <SparklesIcon size={48} color={theme.primary600} />
            </View>
            
            <View className="bg-primary-600 px-4 py-1.5 rounded-full mb-4">
                <Text className="text-white font-black text-xs uppercase tracking-widest">
                    Coming Soon
                </Text>
            </View>

            <Text className="text-3xl font-black text-secondary-900 dark:text-white tracking-tighter text-center mb-4">
                ControlApp AI
            </Text>
            
            <Text className="text-secondary-500 dark:text-secondary-400 text-center font-medium leading-6 max-w-xs">
                {t('tools.ai_chat_coming_soon')}
            </Text>

            <View className="absolute bottom-12 w-full px-8">
                <View className="h-1.5 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                    <View className="h-full bg-primary-600 w-1/3 rounded-full" />
                </View>
                <Text className="text-center text-[10px] font-black text-secondary-400 uppercase tracking-widest mt-3">
                    Development Progress: 35%
                </Text>
            </View>
        </View>
    );
}
