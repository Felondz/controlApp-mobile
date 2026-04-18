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
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslate } from '../hooks';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTheme } from '../themes';
import {
    BugIcon,
    XMarkIcon,
    WarningIcon,
    CogIcon,
    AppIcon,
    CheckListIcon,
    ChatIcon,
    CameraIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from '../icons';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { ptrApi } from '../../services/api';

const CATEGORIES = [
    { key: 'functionality', icon: CogIcon, color: '#6366f1' },
    { key: 'ui_visual', icon: WarningIcon, color: '#ec4899' },
    { key: 'translation', icon: ChatIcon, color: '#3b82f6' },
    { key: 'performance', icon: AppIcon, color: '#8b5cf6' },
    { key: 'other', icon: CheckListIcon, color: '#10b981' },
];

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
        if (!val) reset();
    };

    const [category, setCategory] = useState('functionality');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setCategory('functionality');
        setDescription('');
        setSeverity('medium');
        setScreenshot(null);
        setSuccess(false);
        setError(null);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setError(t('profile.permission_denied'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setScreenshot(result.assets[0].uri);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!description) return;
        setSubmitting(true);
        setError(null);
        
        try {
            // Standard data for both JSON and FormData
            const baseData = {
                category,
                description,
                title: description.substring(0, 50),
                severity,
                priority: severity, // Some backends use priority instead of severity
                platform: 'mobile',
                device: `${Platform.OS} ${Platform.Version}`,
                page_url: 'app://bug-reporter',
                context: 'mobile'
            };

            let payload: any;
            
            if (screenshot) {
                const formData = new FormData();
                Object.entries(baseData).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                const filename = screenshot.split('/').pop() || 'screenshot.jpg';
                const match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image/jpeg`;

                // Normalization for common extensions
                if (type === 'image/jpg') type = 'image/jpeg';

                // @ts-ignore
                formData.append('screenshot', {
                    uri: screenshot,
                    name: filename,
                    type,
                });
                payload = formData;
            } else {
                payload = baseData;
            }

            await ptrApi.reportBug(payload);
            
            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                reset();
            }, 2000);
        } catch (err: any) {
            console.error('Bug report error:', err);
            
            let errorMessage = t('bug_reporter.submit_error');
            
            if (err.response?.data) {
                const data = err.response.data;
                // Log the full error to help debugging 422s
                console.log('Server validation error details:', JSON.stringify(data));
                
                if (data.errors) {
                    // Laravel validation errors
                    const firstError = Object.values(data.errors).flat()[0];
                    errorMessage = String(firstError);
                } else if (data.message) {
                    errorMessage = data.message;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage.toLowerCase());
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
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
                    <View className="bg-white dark:bg-secondary-900 rounded-t-[32px] shadow-2xl border-t border-secondary-100 dark:border-secondary-800 h-[75%]">
                        {/* Header Compact */}
                        <View className="flex-row items-center justify-between px-6 py-4 border-b border-secondary-100 dark:border-secondary-800">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 items-center justify-center mr-3">
                                    <BugIcon size={18} color={theme.primary600} />
                                </View>
                                <Text className="text-lg font-black text-secondary-900 dark:text-secondary-50">
                                    {t('bug_reporter.title')}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2 bg-secondary-100 dark:bg-secondary-800 rounded-full">
                                <XMarkIcon size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                            {success ? (
                                <View className="items-center py-10">
                                    <View className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full items-center justify-center mb-4">
                                        <CheckListIcon size={32} color="#10b981" />
                                    </View>
                                    <Text className="text-xl font-black text-secondary-900 dark:text-secondary-50 text-center mb-1">
                                        {t('bug_reporter.success_title')}
                                    </Text>
                                    <Text className="text-sm text-secondary-500 dark:text-secondary-400 text-center font-medium">
                                        {t('bug_reporter.success')}
                                    </Text>
                                </View>
                            ) : (
                                <View className="gap-5 pb-10">
                                    {/* Error Message UI */}
                                    {error && (
                                        <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex-row items-center border border-red-100 dark:border-red-900/30">
                                            <ExclamationTriangleIcon size={18} color="#ef4444" />
                                            <Text className="ml-3 flex-1 text-xs font-bold text-red-700 dark:text-red-400">
                                                {error}
                                            </Text>
                                            <TouchableOpacity onPress={() => setError(null)}>
                                                <XMarkIcon size={14} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Category Chips */}
                                    <View>
                                        <Text className="text-[10px] font-black text-secondary-400 uppercase tracking-[2px] mb-3 ml-1">
                                            {t('bug_reporter.select_category')}
                                        </Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                            {CATEGORIES.map((cat) => (
                                                <TouchableOpacity
                                                    key={cat.key}
                                                    onPress={() => {
                                                        setCategory(cat.key);
                                                        setError(null);
                                                    }}
                                                    activeOpacity={0.7}
                                                    className={`px-4 py-2.5 rounded-2xl border flex-row items-center mr-2 ${
                                                        category === cat.key 
                                                            ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800'
                                                            : 'bg-white dark:bg-secondary-800 border-secondary-100 dark:border-secondary-700'
                                                    }`}
                                                >
                                                    <cat.icon size={16} color={category === cat.key ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                                                    <Text className={`ml-2 text-xs font-bold ${
                                                        category === cat.key ? 'text-primary-700 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400'
                                                    }`}>
                                                        {t(`bug_reporter.category_${cat.key}`)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {/* Description */}
                                    <View>
                                        <Text className="text-[10px] font-black text-secondary-400 uppercase tracking-[2px] mb-2 ml-1">
                                            {t('bug_reporter.description')}
                                        </Text>
                                        <TextInput
                                            multiline
                                            value={description}
                                            onChangeText={(text) => {
                                                setDescription(text);
                                                if (error) setError(null);
                                            }}
                                            placeholder={t(`bug_reporter.hint_${category}`)}
                                            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                            className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-2xl border border-secondary-100 dark:border-secondary-700 text-secondary-900 dark:text-secondary-100 text-sm"
                                            style={{ textAlignVertical: 'top', minHeight: 80 }}
                                        />
                                    </View>

                                    {/* Screenshot Section */}
                                    <View className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-2xl border border-dashed border-secondary-200 dark:border-secondary-700">
                                        <View className="flex-row items-center mb-3">
                                            <CameraIcon size={18} color={theme.primary600} />
                                            <Text className="ml-2 text-xs font-bold text-secondary-900 dark:text-secondary-100">
                                                {t('bug_reporter.add_screenshot')}
                                            </Text>
                                        </View>
                                        
                                        <Text className="text-[11px] text-secondary-500 dark:text-secondary-400 leading-4 mb-4">
                                            {t('bug_reporter.screenshot_instructions')}
                                        </Text>

                                        {screenshot ? (
                                            <View className="relative w-full h-40 rounded-xl overflow-hidden bg-black/5">
                                                <Image source={{ uri: screenshot }} className="w-full h-full" resizeMode="contain" />
                                                <TouchableOpacity 
                                                    onPress={() => setScreenshot(null)}
                                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center shadow-md"
                                                >
                                                    <TrashIcon size={14} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity 
                                                onPress={pickImage}
                                                className="w-full py-4 border border-secondary-200 dark:border-secondary-700 rounded-xl items-center justify-center bg-white dark:bg-secondary-800"
                                            >
                                                <Text className="text-xs font-bold text-primary-600">
                                                    + {t('common.add')}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="mt-2 gap-3">
                                        <PrimaryButton
                                            onPress={handleSubmit}
                                            loading={submitting}
                                            variant="filled"
                                            size="md"
                                            disabled={!description}
                                        >
                                            {t('bug_reporter.submit')}
                                        </PrimaryButton>
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
