import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, InteractionManager, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslate, useAppTheme } from '../../../../src/shared/hooks';
import { projectsApi } from '../../../../src/services/api';
import { Input, PrimaryButton } from '../../../../src/shared/components';
import { EnvelopeIcon } from '../../../../src/shared/icons';

export default function InviteMemberScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    
    const [isReady, setIsReady] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => setIsReady(true));
        return () => task.cancel();
    }, []);

    const handleSendInvite = async () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert(t('common.error'), t('validation.required_fields'));
            return;
        }

        setLoading(true);
        try {
            await projectsApi.inviteMember(id as string, email, role);
            Alert.alert(t('common.success'), t('projects.members.invite_success'), [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.message || t('common.error');
            Alert.alert(t('common.error'), msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isReady) return null;

    return (
        <ScrollView className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <View className="p-6">
                <View className="mb-8 items-center">
                    <View className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-900/20 items-center justify-center mb-4">
                        <EnvelopeIcon size={40} color={theme.primary600} />
                    </View>
                    <Text className="text-2xl font-black text-secondary-900 dark:text-white tracking-tighter text-center">
                        {t('projects.members.invite_title')}
                    </Text>
                    <Text className="text-secondary-500 dark:text-secondary-400 text-center mt-2 px-4 font-medium leading-5">
                        {t('projects.members.invite_desc')}
                    </Text>
                </View>

                <View className="bg-white dark:bg-secondary-900 rounded-[28px] p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm gap-6">
                    <Input
                        label={t('auth.email')}
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('projects.members.email_placeholder')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <View>
                        <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 mb-3 px-1">
                            {t('projects.members.role', 'Rol del Miembro')}
                        </Text>
                        <View className="flex-row gap-3">
                            {['member', 'admin'].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    onPress={() => setRole(r)}
                                    className={`flex-1 p-4 rounded-2xl border-2 items-center ${
                                        role === r 
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-600' 
                                            : 'bg-secondary-50 dark:bg-secondary-800 border-secondary-100 dark:border-secondary-700'
                                    }`}
                                >
                                    <Text className={`font-black uppercase text-xs ${role === r ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}>
                                        {r}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="pt-4">
                        <PrimaryButton 
                            onPress={handleSendInvite} 
                            loading={loading}
                            size="xl"
                        >
                            {t('projects.members.send_invite')}
                        </PrimaryButton>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
