import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import { UsersIcon } from '../../../src/shared/icons';

export default function InvitationsScreen() {
    const { t } = useTranslate();
    const { theme } = useAppTheme();

    return (
        <ScrollView className="flex-1 bg-secondary-50 dark:bg-secondary-950 p-4">
            <View className="items-center py-20 px-8">
                <View 
                    className="w-20 h-20 rounded-full items-center justify-center mb-6"
                    style={{ backgroundColor: `${theme.primary600}15` }}
                >
                    <UsersIcon size={40} color={theme.primary600} />
                </View>
                <Text className="text-xl font-black text-secondary-900 dark:text-secondary-100 text-center mb-2">
                    {t('modules.invitations.title')}
                </Text>
                <Text className="text-secondary-500 dark:text-secondary-400 text-center leading-5 font-medium">
                    {t('modules.invitations.no_pending')}
                </Text>
            </View>
        </ScrollView>
    );
}
