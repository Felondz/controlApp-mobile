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

            <ScrollView className="flex-1 p-4">
                <View className={`${cardBg} ${borderColor} border rounded-xl p-4 mb-4`}>
                    <View className="flex-row items-start justify-between mb-4">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                <FactoryIcon size={16} color={textSecondary} />
                                <Text className={`text-xs ${textSecondary} ml-1`}>
                                    {lote.productionProcess?.name || t('operations.process', 'Proceso')}
                                </Text>
                            </View>
                            <Text className={`text-xl font-bold ${textColor}`}>{lote.code}</Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusBadge(lote.status)}`}>
                            {lote.status}
                        </View>
                    </View>

                    <View className={`h-px ${borderColor} my-4`} />

                    <View className="space-y-4">
                        <View className="flex-row justify-between items-center">
                            <Text className={`text-sm ${textSecondary}`}>
                                {t('operations.current_stage', 'Etapa Actual')}:
                            </Text>
                            <View className={`px-3 py-1 rounded-lg border ${borderColor} ${isDark ? 'bg-secondary-700' : 'bg-secondary-50'}`}>
                                <Text className={`text-sm font-medium ${textColor}`}>
                                    {lote.stage?.name || 'Inicio'}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className={`text-sm ${textSecondary}`}>
                                {t('operations.quantity', 'Cantidad')}:
                            </Text>
                            <Text className={`text-lg font-bold ${textColor}`}>
                                {lote.current_quantity}
                            </Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className={`text-sm flex-row items-center ${textSecondary}`}>
                                <ClockIcon size={14} color={textSecondary} /> 
                                <Text className="ml-1">{t('operations.start_date', 'Fecha Inicio')}:</Text>
                            </Text>
                            <Text className={`text-sm ${textColor}`}>
                                {new Date(lote.start_date).toLocaleDateString()}
                            </Text>
                        </View>

                        {lote.productionProcess?.etapas && lote.productionProcess.etapas.length > 0 && (
                            <View className="mt-4">
                                <Text className={`text-xs font-medium ${textSecondary} mb-2`}>
                                    {t('operations.progress', 'Progreso')}:
                                </Text>
                                <View className="space-y-2">
                                    {lote.productionProcess.etapas.map((etapa, index) => {
                                        const isCurrentStage = etapa.id === lote.stage_id;
                                        const isCompleted = lote.stage ? etapa.order < lote.stage.order : false;
                                        
                                        return (
                                            <View key={etapa.id} className="flex-row items-center">
                                                <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                                                    isCompleted 
                                                        ? 'bg-green-500' 
                                                        : isCurrentStage 
                                                            ? 'bg-primary-500' 
                                                            : isDark ? 'bg-secondary-700' : 'bg-secondary-200'
                                                }`}>
                                                    {isCompleted ? (
                                                        <CheckIcon size={14} color="white" />
                                                    ) : (
                                                        <Text className={`text-xs ${isCurrentStage ? 'text-white' : textSecondary}`}>
                                                            {index + 1}
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text className={`flex-1 text-sm ${
                                                    isCurrentStage ? `font-medium ${textColor}` : textSecondary
                                                }`}>
                                                    {etapa.name}
                                                </Text>
                                                {isCurrentStage && (
                                                    <Text className={`text-xs ${textSecondary}`}>
                                                        {t('common.current', 'Actual')}
                                                    </Text>
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
