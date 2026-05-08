import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';
import { UsersIcon, CheckIcon, XMarkIcon, EnvelopeIcon, ClockIcon } from '../../../src/shared/icons';
import { useQuery, useMutation } from '@apollo/client';
import { INVITATIONS_QUERIES, INVITATIONS_MUTATIONS } from '../../../src/graphql/queries/invitations';
import { Invitation } from '../../../src/types';
import { useAuthStore } from '../../../src/stores/authStore';
import { useDashboardStore } from '../../../src/stores/dashboardStore';

/**
 * InvitationsScreen - Handles project member invitations.
 * Displays pending invitations and allows acceptance or rejection via UUID-based GraphQL mutations.
 */
export default function InvitationsScreen() {
    const { t } = useTranslate();
    const { theme } = useAppTheme();
    const { fetchUser } = useAuthStore();
    const { fetchProjects } = useDashboardStore();

    // Fetch pending invitations
    const { data, loading, refetch } = useQuery(INVITATIONS_QUERIES.GET_PENDING_INVITATIONS, {
        fetchPolicy: 'network-only'
    });

    const [acceptInvitation, { loading: accepting }] = useMutation(INVITATIONS_MUTATIONS.ACCEPT_INVITATION);
    const [rejectInvitation, { loading: rejecting }] = useMutation(INVITATIONS_MUTATIONS.REJECT_INVITATION);

    const onRefresh = useCallback(async () => {
        await refetch();
        await fetchUser(); // Sync notification badge
    }, [refetch, fetchUser]);

    const handleAccept = async (uuid: string) => {
        try {
            await acceptInvitation({ variables: { uuid } });
            Alert.alert(t('common.success'), t('invitations.accepted_message', 'Has aceptado la invitación exitosamente.'));
            refetch();
            fetchUser(); // Update badge
            fetchProjects(); // Update project list to show the new project
        } catch (error: any) {
            console.error('[Invitations] Accept Error:', error);
            Alert.alert(t('common.error'), error.message || t('invitations.accept_error'));
        }
    };

    const handleReject = async (uuid: string) => {
        Alert.alert(
            t('common.confirm'),
            t('invitations.reject_confirm', '¿Estás seguro de que deseas rechazar esta invitación?'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { 
                    text: t('common.reject', 'Rechazar'), 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rejectInvitation({ variables: { uuid } });
                            refetch();
                            fetchUser();
                        } catch (error: any) {
                            console.error('[Invitations] Reject Error:', error);
                            Alert.alert(t('common.error'), error.message || t('invitations.reject_error'));
                        }
                    }
                }
            ]
        );
    };

    const invitations: Invitation[] = (data?.user?.invitations || [])
        .filter((inv: Invitation) => inv.status === 'pending');

    if (loading && !invitations.length) {
        return (
            <View className="flex-1 items-center justify-center bg-secondary-50 dark:bg-secondary-950">
                <ActivityIndicator size="large" color={theme.primary600} />
            </View>
        );
    }

    return (
        <ScrollView 
            className="flex-1 bg-secondary-50 dark:bg-secondary-950"
            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={theme.primary600} />
            }
        >
            <View className="flex-row items-center gap-3 mb-8">
                <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: `${theme.primary600}15` }}
                >
                    <EnvelopeIcon size={24} color={theme.primary600} />
                </View>
                <View>
                    <Text className="text-2xl font-black text-secondary-900 dark:text-secondary-50 tracking-tighter">
                        {t('modules.invitations.title')}
                    </Text>
                    <Text className="text-sm font-medium text-secondary-500">
                        {invitations.length} {t('invitations.pending_count', 'pendientes')}
                    </Text>
                </View>
            </View>

            {invitations.length === 0 ? (
                <View className="items-center py-20 px-8">
                    <UsersIcon size={64} color={theme.secondary300} />
                    <Text className="text-secondary-400 dark:text-secondary-500 text-center leading-5 font-medium mt-4">
                        {t('modules.invitations.no_pending')}
                    </Text>
                </View>
            ) : (
                <View className="gap-4">
                    {invitations.map((inv) => (
                        <View 
                            key={inv.id}
                            className="bg-white dark:bg-secondary-900 rounded-[28px] p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm"
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1 mr-4">
                                    <Text className="text-lg font-black text-secondary-900 dark:text-white mb-1">
                                        {inv.proyecto?.nombre}
                                    </Text>
                                    <Text className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                                        {inv.rol}
                                    </Text>
                                </View>
                                {inv.expires_at && (
                                    <View className="flex-row items-center bg-secondary-50 dark:bg-secondary-800 px-2 py-1 rounded-lg">
                                        <ClockIcon size={12} color="#9ca3af" />
                                        <Text className="text-[10px] text-secondary-500 ml-1 font-bold">
                                            {new Date(inv.expires_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text className="text-secondary-600 dark:text-secondary-400 text-sm leading-5 mb-6">
                                <Text className="font-bold text-secondary-900 dark:text-secondary-100">{inv.invitador?.name}</Text>
                                {' '}{t('invitations.invite_text', 'te ha invitado a colaborar en este proyecto.')}
                            </Text>

                            <View className="flex-row gap-3">
                                <TouchableOpacity 
                                    onPress={() => handleReject(inv.uuid)}
                                    disabled={accepting || rejecting}
                                    className="flex-1 flex-row items-center justify-center py-3.5 bg-secondary-100 dark:bg-secondary-800 rounded-2xl active:opacity-70"
                                >
                                    <XMarkIcon size={18} color="#6b7280" />
                                    <Text className="ml-2 font-bold text-secondary-600 dark:text-secondary-300">
                                        {t('common.reject', 'Rechazar')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => handleAccept(inv.uuid)}
                                    disabled={accepting || rejecting}
                                    className="flex-[1.5] flex-row items-center justify-center py-3.5 bg-primary-600 rounded-2xl active:opacity-80 shadow-md shadow-primary-500/30"
                                >
                                    {accepting ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <>
                                            <CheckIcon size={18} color="white" />
                                            <Text className="ml-2 font-black text-white">
                                                {t('common.accept', 'Aceptar')}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}
