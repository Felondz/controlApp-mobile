import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/stores/authStore';
import { useTranslate, useAppTheme } from '../../src/shared/hooks';
import { Input, PrimaryButton } from '../../src/shared/components';
import { UserIcon, CameraIcon, TrashIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../../src/shared/icons';
import { useRouter } from 'expo-router';
import { authApi } from '../../src/services/api';
import { Modal } from '../../src/shared/components/Modal';
import { resolveImageUrl } from '../../src/shared/utils/image';
import { AppImage } from '../../src/shared/components/media/AppImage';

export default function ProfileScreen() {
    const { user, setUser } = useAuthStore();
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();

    const [name, setName] = useState(user?.name || '');
    const [image, setImage] = useState<string | null>(user?.profile_photo_url || null);
    const [imageChanged, setImageChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ visible: boolean; type: 'success' | 'error'; message: string }>({ 
        visible: false, type: 'success', message: '' 
    });

    // Resolve the display image URL (handles local picking vs remote URL)
    const displayImage = useMemo(() => {
        if (imageChanged) return image; // Local URI from picker
        return resolveImageUrl(image);
    }, [image, imageChanged]);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('common.error'), t('profile.permission_denied', 'Se requiere permiso para acceder a la galería.'));
            return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageChanged(true);
        }
    };

    const handleUpdate = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('validation.required_fields'));
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('name', name);
            
            if (imageChanged && image) {
                const filename = image.split('/').pop() || 'profile.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                // @ts-ignore
                formData.append('image', {
                    uri: image,
                    name: filename,
                    type,
                });
            }

            const response = await authApi.updateProfile(formData);
            
            if (response.data.user) {
                setUser(response.data.user);
            }

            setFeedback({ 
                visible: true, 
                type: 'success', 
                message: t('profile.update_success', 'Perfil actualizado correctamente.') 
            });
        } catch (error: any) {
            console.error('Profile update error:', error.response?.data || error.message);
            setFeedback({ 
                visible: true, 
                type: 'error', 
                message: t('profile.update_error', 'Error al actualizar el perfil.') 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-secondary-50 dark:bg-secondary-950"
        >
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Picker (Reusing NewProject style) */}
                <View className="px-6 mb-8 items-center">
                    <Pressable 
                        onPress={handlePickImage} 
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} 
                        className="w-32 h-32 rounded-2xl bg-white dark:bg-secondary-800 border-2 border-dashed border-secondary-300 dark:border-secondary-600 items-center justify-center overflow-hidden shadow-sm"
                    >
                        {displayImage ? (
                            <AppImage source={{ uri: displayImage }} contentFit="cover" />
                        ) : (
                            <View className="items-center">
                                <CameraIcon size={24} color={theme.primary600} />
                                <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 mt-1">{t('common.photo')}</Text>
                            </View>
                        )}
                    </Pressable>
                </View>

                {/* Basic Info (Reusing NewProject style) */}
                <View className="px-6 mb-6">
                    <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                        <Text className="text-xl font-black text-secondary-900 dark:text-white tracking-tighter mb-6">
                            {t('profile.information')}
                        </Text>
                        
                        <View className="gap-6">
                            <Input
                                label={t('auth.name')}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('auth.name_placeholder')}
                            />

                            <View>
                                <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 mb-2">
                                    {t('auth.email')}
                                </Text>
                                <View className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700">
                                    <Text className="text-secondary-400 dark:text-secondary-50 font-medium">
                                        {user?.email}
                                    </Text>
                                </View>
                                <Text className="text-[10px] text-secondary-400 mt-2 italic">
                                    {t('profile.email_no_change_notice')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Danger Zone */}
                <View className="px-6 mb-6">
                    <View className="bg-red-50/50 dark:bg-red-950/20 rounded-xl p-6 border border-red-100 dark:border-red-900/30">
                        <Text className="text-xl font-black text-red-600 dark:text-red-400 tracking-tighter mb-4">
                            {t('profile.danger_zone')}
                        </Text>
                        
                        <Text className="text-xs text-red-700/70 dark:text-red-400/60 mb-6 leading-5 font-medium">
                            {t('profile.delete_account_instruction')}
                        </Text>

                        <Pressable 
                            onPress={() => {
                                Alert.alert(
                                    t('profile.delete_account'),
                                    t('profile.delete_account_instruction')
                                );
                            }}
                            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                            className="flex-row items-center justify-center p-4 bg-red-600 dark:bg-red-700 rounded-xl shadow-sm"
                        >
                            <TrashIcon size={18} color="white" />
                            <Text className="ml-2 text-sm font-bold text-white">
                                {t('profile.delete_account')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            <Modal 
                visible={feedback.visible} 
                onClose={() => { 
                    setFeedback({ ...feedback, visible: false }); 
                    if (feedback.type === 'success') router.back(); 
                }} 
                title={feedback.type === 'success' ? t('common.success') : t('common.error')}
                headerTextColor={feedback.type === 'success' ? '#10b981' : '#ef4444'}
            >
                <View className="items-center pt-10 pb-16 px-6">
                    {feedback.type === 'success' ? (
                        <CheckCircleIcon size={72} color="#10b981" />
                    ) : (
                        <ExclamationTriangleIcon size={72} color="#ef4444" />
                    )}
                    <Text className="text-xl font-black text-center mt-6 text-secondary-900 dark:text-white">
                        {feedback.message}
                    </Text>
                </View>
            </Modal>

            {/* Floating Action Button Style (Reusing NewProject style) */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl border-t border-secondary-200 dark:border-secondary-800">
                <PrimaryButton 
                    onPress={handleUpdate} 
                    loading={loading} 
                    size="xl"
                >
                    {t('common.save')}
                </PrimaryButton>
            </View>
        </KeyboardAvoidingView>
    );
}
