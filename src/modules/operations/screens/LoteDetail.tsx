import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTranslate } from '../../../shared/hooks/useTranslate';
import { useLoteProduccion, useUpdateLoteStage, useFinishLote, LoteProduccion } from '../useOperations';
import { useProjectStore } from '../../../stores/projectStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useRouter } from 'expo-router';
import { 
    ArrowLeftIcon,
    CheckIcon,
    FactoryIcon,
    ClockIcon,
    ChevronRightIcon,
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import DangerButton from '../../../shared/components/DangerButton';
import { SkeletonList } from '../../../shared/components/Skeleton';

interface LoteDetailProps {
    loteId: string;
    onBack?: () => void;
}

export default function LoteDetail({ loteId, onBack }: LoteDetailProps) {
    const { t } = useTranslate();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    const { isDark } = useSettingsStore();
    
    const { data, loading, error, refetch } = useLoteProduccion(loteId);
    const [advanceStage, { loading: advancing }] = useUpdateLoteStage();
    const [finishLote, { loading: finishing }] = useFinishLote();
    
    const textColor = isDark ? 'text-white' : 'text-secondary-900';
    const textSecondary = isDark ? 'text-secondary-400' : 'text-secondary-500';
    const cardBg = isDark ? 'bg-secondary-800' : 'bg-white';
    const borderColor = isDark ? 'border-secondary-700' : 'border-secondary-200';

    const handleAdvanceStage = async () => {
        if (!activeProject) return;
        
        try {
            await advanceStage({
                variables: {
                    id: loteId,
                    proyecto_id: String(activeProject.id),
                }
            });
            refetch();
            Alert.alert('Éxito', 'Etapa avanzada correctamente');
        } catch (err) {
            console.error('Error advancing stage:', err);
            Alert.alert('Error', 'No se pudo avanzar la etapa');
        }
    };

    const handleFinishLote = async () => {
        Alert.alert(
            t('operations.confirm_finish', 'Confirmar'),
            t('operations.finish_lote_message', '¿Estás seguro de que quieres finalizar este lote?'),
            [
                { text: t('common.cancel', 'Cancelar'), style: 'cancel' },
                {
                    text: t('common.confirm', 'Confirmar'),
                    onPress: async () => {
                        if (!activeProject) return;
                        try {
                            await finishLote({
                                variables: {
                                    id: loteId,
                                    proyecto_id: String(activeProject.id),
                                }
                            });
                            refetch();
                            Alert.alert('Éxito', 'Lote finalizado');
                        } catch (err) {
                            console.error('Error finishing lote:', err);
                            Alert.alert('Error', 'No se pudo finalizar el lote');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
                <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b`}>
                    <SkeletonList count={3} />
                </View>
            </View>
        );
    }

    if (error || !data?.loteProduccion) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'} justify-center items-center`}>
                <Text className={textSecondary}>{t('common.error', 'Error al cargar')}</Text>
                <SecondaryButton onPress={() => refetch()} className="mt-4">
                    {t('common.retry', 'Reintentar')}
                </SecondaryButton>
            </View>
        );
    }

    const lote = data.loteProduccion;
    const isActive = lote.status === 'active';

    const getStatusBadge = (status: string) => {
        return status === 'active'
            ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
            : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
            <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b flex-row items-center`}>
                <TouchableOpacity onPress={onBack || (() => router.back())} className="mr-3">
                    <ArrowLeftIcon size={24} color={textColor} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${textColor}`}>
                    {t('operations.lote_detail', 'Detalle de Lote')}
                </Text>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className={`${cardBg} ${borderColor} border rounded-2xl p-5 mb-6 shadow-sm`}>
                    <View className="flex-row items-start justify-between mb-5">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                <FactoryIcon size={14} color={textSecondary} />
                                <Text className={`text-sm font-bold ${textSecondary} ml-1.5`}>
                                    {lote.productionProcess?.name || t('operations.process', 'Proceso')}
                                </Text>
                            </View>
                            <Text className={`text-xl font-bold ${textColor}`}>{lote.code}</Text>
                        </View>
                        <View className={`px-2.5 py-0.5 rounded-full ${getStatusBadge(lote.status)}`}>
                            <Text className="text-sm font-bold">{lote.status}</Text>
                        </View>
                    </View>

                    <View className={`h-px ${borderColor} my-5`} />

                    <View className="space-y-4">
                        <View className="flex-row justify-between items-center">
                            <Text className={`text-sm font-bold ${textSecondary}`}>
                                {t('operations.current_stage', 'Etapa Actual')}:
                            </Text>
                            <View className={`px-3 py-1 rounded-xl border ${borderColor} ${isDark ? 'bg-secondary-700' : 'bg-secondary-50'}`}>
                                <Text className={`text-sm font-bold ${textColor}`}>
                                    {lote.stage?.name || 'Inicio'}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className={`text-sm font-bold ${textSecondary}`}>
                                {t('operations.quantity', 'Cantidad')}:
                            </Text>
                            <Text className={`text-base font-black ${textColor}`}>
                                {lote.current_quantity}
                            </Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <ClockIcon size={14} color={textSecondary} /> 
                                <Text className={`text-sm font-bold ${textSecondary} ml-1`}>{t('operations.start_date', 'Fecha Inicio')}:</Text>
                            </View>
                            <Text className={`text-sm font-bold ${textColor}`}>
                                {new Date(lote.start_date).toLocaleDateString()}
                            </Text>
                        </View>

                        {lote.productionProcess?.etapas && lote.productionProcess.etapas.length > 0 && (
                            <View className="mt-5">
                                <Text className={`text-sm font-black ${textSecondary} mb-3 uppercase tracking-widest`}>
                                    {t('operations.workflow', 'Flujo de Trabajo')}:
                                </Text>
                                <View className="gap-3">
                                    {lote.productionProcess.etapas.map((etapa, index) => {
                                        const isCurrentStage = etapa.id === lote.stage_id;
                                        const isCompleted = lote.stage ? etapa.order < lote.stage.order : false;
                                        
                                        return (
                                            <View key={etapa.id} className="flex-row items-center">
                                                <View className={`w-7 h-7 rounded-xl items-center justify-center mr-3 ${
                                                    isCompleted 
                                                        ? 'bg-green-500' 
                                                        : isCurrentStage 
                                                            ? 'bg-primary-500' 
                                                            : isDark ? 'bg-secondary-700' : 'bg-secondary-100'
                                                }`}>
                                                    {isCompleted ? (
                                                        <CheckIcon size={16} color="white" />
                                                    ) : (
                                                        <Text className={`text-sm font-bold ${isCurrentStage ? 'text-white' : textSecondary}`}>
                                                            {index + 1}
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text className={`flex-1 text-base ${
                                                    isCurrentStage ? `font-bold ${textColor}` : `font-medium ${textSecondary}`
                                                }`}>
                                                    {etapa.name}
                                                </Text>
                                                {isCurrentStage && (
                                                    <View className="bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-800">
                                                        <Text className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                                            {t('common.current', 'Actual')}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {isActive && (
                    <View className="gap-3">
                        <PrimaryButton
                            onPress={handleAdvanceStage}
                            loading={advancing}
                        >
                            {t('operations.advance_stage', 'Avanzar Etapa')}
                        </PrimaryButton>
                        
                        <DangerButton
                            onPress={handleFinishLote}
                            loading={finishing}
                        >
                            {t('operations.finish_lote', 'Finalizar Lote')}
                        </DangerButton>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
