import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useTranslate } from '../hooks';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTheme } from '../themes';
import {
    BugIcon,
    XMarkIcon,
    ChevronLeftIcon,
    GlobeAltIcon,
    CogIcon,
    InfoIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    CameraIcon
} from '../icons';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { ptrApi } from '../../services/api';

const CATEGORIES = [
    { key: 'translation', icon: GlobeAltIcon, color: '#3b82f6' },
    { key: 'functionality', icon: CogIcon, color: '#6366f1' },
    { key: 'unclear_info', icon: InfoIcon, color: '#f59e0b' },
    { key: 'ui_visual', icon: ExclamationTriangleIcon, color: '#ec4899' },
    { key: 'performance', icon: ClockIcon, color: '#8b5cf6' },
    { key: 'other', icon: CheckCircleIcon, color: '#10b981' },
];

const SEVERITIES = ['low', 'medium', 'high'] as const;

interface BugReporterWidgetProps {
    visible?: boolean;
    onClose?: () => void;
    showFloatingButton?: boolean;
}

export const BugReporterWidget = ({ 
    visible: externalVisible, 
    onClose: externalOnClose,
    showFloatingButton = true 
}: BugReporterWidgetProps) => {
    const { t } = useTranslate();
    const { theme: themeName, isDark } = useSettingsStore();
    const theme = getTheme(themeName);

    const [internalVisible, setInternalVisible] = useState(false);
    
    // Controlled or internal state
    const isOpen = externalVisible !== undefined ? externalVisible : internalVisible;
    const setIsOpen = (val: boolean) => {
        if (externalOnClose && !val) externalOnClose();
        setInternalVisible(val);
    };

    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const reset = () => {
        setStep(1);
        setCategory('');
        setDescription('');
        setSeverity('medium');
        setSuccess(false);
    };

    const handleSubmit = async () => {
        if (!description) return;
        setSubmitting(true);
        try {
            // API Integration Parity
            await ptrApi.reportBug({
                category,
                description,
                severity,
                platform: Platform.OS,
                device: Platform.Version,
                context: 'mobile'
            });
            
            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                reset();
            }, 2000);
        } catch (err) {
            Alert.alert(t('common.error'), t('bug_reporter.submit_error', 'Error al enviar el reporte.'));
        } finally {
            setSubmitting(false);
        }
    };

    const selectCategory = (key: string) => {
        setCategory(key);
        setStep(2);
    };

    return (
        <>
            {/* Floating Action Button */}
            {showFloatingButton && (
                <TouchableOpacity
                    onPress={() => setIsOpen(true)}
                    activeOpacity={0.8}
                    className="absolute bottom-6 left-6 w-12 h-12 rounded-2xl items-center justify-center shadow-lg z-50"
                    style={{ backgroundColor: theme.primary600, elevation: 5 }}
                >
                    <BugIcon size={24} color="white" />
                </TouchableOpacity>
            )}

            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end bg-black/40"
                >
                    <View className="bg-white dark:bg-secondary-900 rounded-t-[40px] shadow-2xl border-t border-secondary-100 dark:border-secondary-800 h-[80%]">
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-6 py-6 border-b border-secondary-100 dark:border-secondary-800">
                            <View className="flex-row items-center">
                                {step === 2 && (
                                    <TouchableOpacity onPress={() => setStep(1)} className="mr-3 p-2 bg-secondary-100 dark:bg-secondary-800 rounded-xl">
                                        <ChevronLeftIcon size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                                    </TouchableOpacity>
                                )}
                                <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 items-center justify-center mr-3">
                                    <BugIcon size={22} color={theme.primary600} />
                                </View>
                                <Text className="text-xl font-black text-secondary-900 dark:text-secondary-50 tracking-tighter">
                                    {t('bug_reporter.title', 'Reportar Bug')}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2 bg-secondary-100 dark:bg-secondary-800 rounded-xl">
                                <XMarkIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 40 }}>
                            {success ? (
                                <View className="items-center py-12">
                                    <View className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full items-center justify-center mb-6">
                                        <CheckCircleIcon size={48} color="#10b981" />
                                    </View>
                                    <Text className="text-2xl font-black text-secondary-900 dark:text-secondary-50 text-center mb-2">
                                        {t('bug_reporter.success_title', '¡Recibido!')}
                                    </Text>
                                    <Text className="text-base text-secondary-500 dark:text-secondary-400 text-center font-medium">
                                        {t('bug_reporter.success', 'Gracias por ayudarnos a mejorar.')}
                                    </Text>
                                </View>
                            ) : step === 1 ? (
                                <View>
                                    <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 mb-6 uppercase tracking-widest">
                                        {t('bug_reporter.select_category', '¿Qué tipo de problema es?')}
                                    </Text>
                                    <View className="flex-row flex-wrap gap-4">
                                        {CATEGORIES.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.key}
                                                onPress={() => selectCategory(cat.key)}
                                                activeOpacity={0.7}
                                                className="w-[47%] bg-white dark:bg-secondary-800 p-5 rounded-[24px] border border-secondary-100 dark:border-secondary-700 shadow-sm"
                                            >
                                                <View 
                                                    className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
                                                    style={{ backgroundColor: `${cat.color}15` }}
                                                >
                                                    <cat.icon size={24} color={cat.color} />
                                                </View>
                                                <Text className="font-bold text-secondary-900 dark:text-secondary-100 text-xs uppercase tracking-tight">
                                                    {t(`bug_reporter.category_${cat.key}`, cat.key)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View className="gap-6">
                                    {/* Description */}
                                    <View>
                                        <Text className="text-xs font-black text-secondary-400 uppercase tracking-widest mb-2 ml-1">
                                            {t('bug_reporter.description', 'Descripción')}
                                        </Text>
                                        <TextInput
                                            multiline
                                            numberOfLines={4}
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder={t(`bug_reporter.hint_${category}`, 'Explica qué pasó...')}
                                            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                            className="bg-secondary-50 dark:bg-secondary-800 p-5 rounded-3xl border border-secondary-100 dark:border-secondary-700 text-secondary-900 dark:text-secondary-100 text-base"
                                            style={{ textAlignVertical: 'top', minHeight: 120 }}
                                        />
                                    </View>

                                    {/* Severity */}
                                    <View>
                                        <Text className="text-xs font-black text-secondary-400 uppercase tracking-widest mb-3 ml-1">
                                            {t('bug_reporter.severity', 'Prioridad')}
                                        </Text>
                                        <View className="flex-row gap-3">
                                            {SEVERITIES.map((sev) => (
                                                <TouchableOpacity
                                                    key={sev}
                                                    onPress={() => setSeverity(sev)}
                                                    className={`flex-1 py-3.5 rounded-2xl border-2 items-center justify-center ${
                                                        severity === sev 
                                                            ? (sev === 'high' ? 'bg-red-50 border-red-500' : sev === 'medium' ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500')
                                                            : 'bg-white dark:bg-secondary-800 border-secondary-100 dark:border-secondary-700'
                                                    }`}
                                                >
                                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${
                                                        severity === sev ? 'text-secondary-900' : 'text-secondary-400'
                                                    }`}>
                                                        {t(`bug_reporter.severity_${sev}`, sev)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="mt-4 gap-4">
                                        <PrimaryButton
                                            onPress={handleSubmit}
                                            loading={submitting}
                                            variant="filled"
                                            size="lg"
                                            disabled={!description}
                                        >
                                            {t('bug_reporter.submit', 'Enviar Reporte')}
                                        </PrimaryButton>
                                        <SecondaryButton
                                            onPress={() => setStep(1)}
                                            variant="ghost"
                                            size="md"
                                        >
                                            {t('common.back', 'Atrás')}
                                        </SecondaryButton>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
};
