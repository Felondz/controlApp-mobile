import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, InteractionManager, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useTranslate, useAppTheme } from '../../../../src/shared/hooks';
import { projectsApi } from '../../../../src/services/api';
import { UserIcon, UserGroupIcon, EnvelopeIcon, TrashIcon, ChevronRightIcon, PlusIcon } from '../../../../src/shared/icons';
import { PrimaryButton, Skeleton } from '../../../../src/shared/components';

const MemberItem = React.memo(({ item, theme, t, onRemove, onChangeRole }: any) => (
    <View className="bg-white dark:bg-secondary-900 p-4 rounded-2xl mb-3 border border-secondary-100 dark:border-secondary-800 flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-800 items-center justify-center mr-4">
            <UserIcon size={24} color={theme.secondary500} />
        </View>
        <View className="flex-1">
            <Text className="text-secondary-900 dark:text-white font-black text-base" numberOfLines={1}>
                {item.user.name}
            </Text>
            <Text className="text-secondary-500 dark:text-secondary-400 text-xs font-medium uppercase tracking-widest">
                {item.role}
            </Text>
        </View>
        <View className="flex-row gap-2">
            <TouchableOpacity 
                onPress={() => onChangeRole(item)}
                className="p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
            >
                <ChevronRightIcon size={18} color={theme.secondary400} />
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => onRemove(item)}
                className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
                <TrashIcon size={18} color="#ef4444" />
            </TouchableOpacity>
        </View>
    </View>
));

const InvitationItem = React.memo(({ item, theme, t }: any) => (
    <View className="bg-white dark:bg-secondary-900 p-4 rounded-2xl mb-3 border border-secondary-100 dark:border-secondary-800 flex-row items-center border-dashed">
        <View className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 items-center justify-center mr-4">
            <EnvelopeIcon size={20} color={theme.primary600} />
        </View>
        <View className="flex-1">
            <Text className="text-secondary-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                {item.email}
            </Text>
            <Text className="text-primary-600 text-[10px] font-black uppercase">
                {item.status}
            </Text>
        </View>
    </View>
));

export default function ProjectMembersScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            setIsReady(true);
            fetchData();
        });
        return () => task.cancel();
    }, []);

    const fetchData = async () => {
        try {
            const [membersRes, invitesRes] = await Promise.all([
                projectsApi.getMembers(id as string),
                projectsApi.getInvitations(id as string)
            ]);
            setMembers(membersRes.data.members);
            setInvitations(invitesRes.data.invitations);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = useCallback((member: any) => {
        Alert.alert(
            t('common.confirm'),
            t('projects.members.remove_confirm', { name: member.user.name }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { 
                    text: t('common.delete'), 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await projectsApi.removeMember(id as string, member.id);
                            setMembers(prev => prev.filter((m: any) => m.id !== member.id));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('common.error'));
                        }
                    }
                }
            ]
        );
    }, [id, t]);

    const handleChangeRole = useCallback(async (member: any) => {
        // Simple toggle for demo, usually would open a picker
        const newRole = member.role === 'admin' ? 'member' : 'admin';
        try {
            await projectsApi.updateMemberRole(id as string, member.id, newRole);
            setMembers(prev => prev.map((m: any) => m.id === member.id ? { ...m, role: newRole } : m));
        } catch (error) {
            Alert.alert(t('common.error'), t('common.error'));
        }
    }, [id, t]);

    if (!isReady) {
        return (
            <View className="flex-1 bg-secondary-50 dark:bg-secondary-950 p-6">
                <Skeleton width="100%" height={80} count={6} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
                <View>
                    <Text className="text-3xl font-black text-secondary-900 dark:text-white tracking-tighter">
                        {t('projects.members.title')}
                    </Text>
                    <Text className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">
                        {members.length} {t('projects.members.active')}
                    </Text>
                </View>
                <TouchableOpacity 
                    onPress={() => router.push(`/(app)/projects/${id}/invite`)}
                    className="w-12 h-12 rounded-full items-center justify-center bg-primary-600 shadow-lg shadow-primary-500/30"
                >
                    <PlusIcon size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={theme.primary600} />
                </View>
            ) : (
                <FlashList
                    data={[...members, ...invitations.map(i => ({ ...i, isInvitation: true }))]}
                    renderItem={({ item }: any) => item.isInvitation ? (
                        <InvitationItem item={item} theme={theme} t={t} />
                    ) : (
                        <MemberItem 
                            item={item} 
                            theme={theme} 
                            t={t} 
                            onRemove={handleRemove}
                            onChangeRole={handleChangeRole}
                        />
                    )}
                    estimatedItemSize={84}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    ListHeaderComponent={invitations.length > 0 ? (
                        <Text className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-4">
                            {t('projects.members.invitations')}
                        </Text>
                    ) : null}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <UserGroupIcon size={64} color={theme.secondary200} />
                            <Text className="text-secondary-400 font-bold mt-4 text-center">
                                {t('common.no_results')}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
