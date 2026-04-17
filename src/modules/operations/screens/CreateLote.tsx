import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateLote, useProductionProcesses } from '../useOperations';
import { 
    FactoryIcon, 
    CalendarIcon, 
    ChatIcon,
    ChevronLeftIcon,
    CheckIcon,
    ChevronDownIcon
} from '../../../shared/icons';
import { Input, PrimaryButton, SecondaryButton, Modal } from '../../../shared/components';
import { useTranslate, useAppTheme } from '../../../shared/hooks';

interface CreateLoteProps {
    proyectoId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CreateLote({ proyectoId, onSuccess, onCancel }: CreateLoteProps) {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();

    const [processId, setProcessId] = useState('');
    const [processName, setProcessName] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [showProcessModal, setShowProcessModal] = useState(false);

    const { data: processesData, loading: loadingProcesses } = useProductionProcesses(proyectoId);
    const [createLote, { loading: creating }] = useCreateLote();

    const processes = processesData?.productionProcesses?.data || [];

    const handleCreate = async () => {
        if (!processId) {
            alert(t('operations.error_select_process', 'Por favor selecciona un proceso'));
            return;
        }

        try {
            await createLote({
                variables: {
                    proyecto_id: proyectoId,
                    production_process_id: processId,
                    start_date: startDate,
                    notes: notes
                }
            });
            if (onSuccess) onSuccess();
            else router.back();
        } catch (error) {
            console.error('Error creating lote:', error);
            alert(t('common.error_occurred', 'Ocurrió un error al crear el lote'));
        }
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        else router.back();
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            {/* Header */}
            <View className="px-5 pt-4 pb-6 bg-white dark:bg-secondary-950 border-b border-secondary-100 dark:border-secondary-900">
                <View className="flex-row items-center px-1">
                    <TouchableOpacity
                        onPress={handleCancel}
                        className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-800 items-center justify-center mr-4"
                    >
                        <ChevronLeftIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black tracking-tighter text-secondary-900 dark:text-secondary-50">
                            {t('operations.new_lote', 'Nuevo Lote')}
                        </Text>
                        <Text className="text-secondary-500 dark:text-secondary-400 text-sm font-bold mt-0.5">
                            {t('operations.create_production_unit', 'Crear unidad de producción')}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-secondary-100 dark:border-secondary-800 shadow-sm mb-6">
                    {/* Process Selector */}
                    <View className="mb-5">
                        <Text className="text-secondary-500 dark:text-secondary-400 font-bold mb-2.5 text-sm ml-1">
                            {t('operations.production_process', 'Proceso de Producción')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowProcessModal(true)}
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-2xl px-5 py-4"
                        >
                            <View className="flex-row items-center">
                                <FactoryIcon size={20} color={processId ? theme.primary600 : (isDark ? '#4b5563' : '#9ca3af')} />
                                <Text className={`ml-3 text-base font-bold ${processId ? 'text-secondary-900 dark:text-secondary-50' : 'text-secondary-400'}`}>
                                    {processName || t('operations.select_process', 'Seleccionar proceso...')}
                                </Text>
                            </View>
                            <ChevronDownIcon size={20} color={isDark ? '#4b5563' : '#9ca3af'} />
                        </TouchableOpacity>
                    </View>

                    {/* Start Date */}
                    <Input
                        label={t('operations.start_date', 'Fecha de Inicio')}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="YYYY-MM-DD"
                        autoCapitalize="none"
                    />

                    {/* Notes/Input */}
                    <Input
                        label={t('operations.notes', 'Notas')}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder={t('operations.notes_placeholder', 'Observaciones del lote...')}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        className="h-32 pt-4"
                    />
                </View>

                <View className="flex-row gap-3 mb-10">
                    <SecondaryButton 
                        onPress={handleCancel}
                        className="flex-1"
                    >
                        <Text className="font-bold">{t('common.cancel', 'Cancelar')}</Text>
                    </SecondaryButton>
                    <PrimaryButton 
                        onPress={handleCreate}
                        loading={creating}
                        className="flex-1"
                    >
                        <Text className="text-white font-bold">{t('common.create', 'Crear Lote')}</Text>
                    </PrimaryButton>
                </View>
            </ScrollView>

            {/* Process Selection Modal */}
            <Modal
                visible={showProcessModal}
                onClose={() => setShowProcessModal(false)}
                title={t('operations.select_process', 'Seleccionar Proceso')}
            >
                {loadingProcesses ? (
                    <View className="py-10">
                        <ActivityIndicator color={theme.primary600} />
                    </View>
                ) : processes.length === 0 ? (
                    <View className="py-10 items-center">
                        <Text className="text-secondary-500 dark:text-secondary-400 text-center">
                            {t('operations.no_processes_found', 'No se encontraron procesos configurados')}
                        </Text>
                    </View>
                ) : (
                    <ScrollView className="max-h-96">
                        {processes.map((proc) => (
                            <TouchableOpacity
                                key={proc.id}
                                onPress={() => {
                                    setProcessId(proc.id);
                                    setProcessName(proc.name);
                                    setShowProcessModal(false);
                                }}
                                className={`flex-row items-center justify-between p-3.5 mb-2 rounded-xl border ${
                                    processId === proc.id 
                                        ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' 
                                        : 'bg-secondary-50 border-secondary-100 dark:bg-secondary-800/50 dark:border-secondary-800'
                                }`}
                            >
                                <View className="flex-row items-center">
                                    <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                                        processId === proc.id ? 'bg-primary-500' : 'bg-secondary-200 dark:bg-secondary-700'
                                    }`}>
                                        <FactoryIcon size={18} color={processId === proc.id ? 'white' : (isDark ? '#9ca3af' : '#6b7280')} />
                                    </View>
                                    <View>
                                        <Text className={`text-base font-bold ${processId === proc.id ? 'text-primary-700 dark:text-primary-400' : 'text-secondary-900 dark:text-secondary-100'}`}>
                                            {proc.name}
                                        </Text>
                                        <Text className="text-sm text-secondary-500 font-bold">
                                            {proc.etapas?.length || 0} {t('operations.stages', 'Etapas')}
                                        </Text>
                                    </View>
                                </View>
                                {processId === proc.id && (
                                    <View className="bg-primary-500 rounded-full p-1">
                                        <CheckIcon size={12} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </Modal>
        </View>
    );
}
