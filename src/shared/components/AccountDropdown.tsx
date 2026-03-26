import React from 'react';
import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import { useTranslate, useAppTheme } from '../hooks';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { 
    UserCircleIcon, 
    Cog6ToothIcon, 
    InboxIcon, 
    IconES, 
    IconEN, 
    ArrowRightOnRectangleIcon,
    ChevronRightIcon
} from '../icons';
import { useRouter } from 'expo-router';

interface AccountDropdownProps {
    visible: boolean;
    onClose: () => void;
    anchorLayout?: { x: number, y: number, width: number, height: number };
}

export const AccountDropdown = ({ visible, onClose, anchorLayout }: AccountDropdownProps) => {
    const { t } = useTranslate();
    const { user, logout } = useAuthStore();
    const { locale, setLocale, isDark } = useSettingsStore();
    const { theme: themeColors } = useAppTheme();
    const router = useRouter();

    if (!visible) return null;

    const handleNavigate = (path: string) => {
        onClose();
        router.push(path as any);
    };

    const handleLogout = () => {
        onClose();
        logout();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/20 dark:bg-black/40">
                    <View 
                        className="absolute right-4 bg-white dark:bg-secondary-800 rounded-[32px] shadow-2xl border border-secondary-100 dark:border-secondary-700 overflow-hidden w-72"
                        style={{ top: (anchorLayout?.y || 0) + (anchorLayout?.height || 0) + 8 }}
                    >
                        {/* Header: User Info */}
                        <View className="p-6 bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-100 dark:border-secondary-700">
                            <View className="flex-row items-center mb-1">
                                <View 
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-3 shadow-sm"
                                    style={{ backgroundColor: themeColors.primary600 }}
                                >
                                    <UserCircleIcon size={28} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-black text-secondary-900 dark:text-secondary-50 text-base" numberOfLines={1}>
                                        {user?.name}
                                    </Text>
                                    <Text className="text-xs font-medium text-secondary-500 dark:text-secondary-400" numberOfLines={1}>
                                        {user?.email}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Menu Options */}
                        <View className="p-2">
                            <MenuOption 
                                icon={<Cog6ToothIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />}
                                label={t('profile.edit', 'Editar Perfil')}
                                onPress={() => handleNavigate('/(app)/settings')}
                                themeColors={themeColors}
                            />
                            <MenuOption 
                                icon={<InboxIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />}
                                label={t('inbox.title', 'Buzón de entrada')}
                                badge={user?.unread_messages_count}
                                onPress={() => handleNavigate('/(app)/invitations')}
                                themeColors={themeColors}
                            />
                            
                            <View className="h-[1px] bg-secondary-100 dark:bg-secondary-700 my-2 mx-4" />
                            
                            {/* Language Switcher Section */}
                            <Text className="text-[10px] font-black text-secondary-400 uppercase tracking-widest px-4 py-2">
                                {t('common.language', 'Idioma')}
                            </Text>
                            <View className="flex-row px-2 gap-2 mb-2">
                                <LanguageButton 
                                    active={locale === 'es'} 
                                    onPress={() => setLocale('es')}
                                    icon={<IconES size={18} color={locale === 'es' ? themeColors.primary600 : '#9ca3af'} />}
                                    label="ES"
                                    themeColors={themeColors}
                                />
                                <LanguageButton 
                                    active={locale === 'en'} 
                                    onPress={() => setLocale('en')}
                                    icon={<IconEN size={18} color={locale === 'en' ? themeColors.primary600 : '#9ca3af'} />}
                                    label="EN"
                                    themeColors={themeColors}
                                />
                            </View>

                            <View className="h-[1px] bg-secondary-100 dark:bg-secondary-700 my-2 mx-4" />

                            <Pressable 
                                onPress={handleLogout}
                                className="flex-row items-center px-4 py-4 m-1 rounded-2xl active:bg-danger-50 dark:active:bg-danger-900/10"
                            >
                                <ArrowRightOnRectangleIcon size={20} color="#ef4444" />
                                <Text className="ml-3 font-bold text-danger-600 dark:text-danger-400">
                                    {t('auth.logout', 'Cerrar Sesión')}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const MenuOption = ({ icon, label, onPress, badge, themeColors }: any) => (
    <Pressable 
        onPress={onPress}
        className="flex-row items-center justify-between px-4 py-3.5 m-1 rounded-2xl active:bg-secondary-100 dark:active:bg-secondary-700"
    >
        {({ pressed }) => (
            <>
                <View className="flex-row items-center">
                    {icon}
                    <Text className={`ml-3 font-bold ${pressed ? 'text-primary-600' : 'text-secondary-700 dark:text-secondary-200'}`} style={pressed ? { color: themeColors.primary600 } : {}}>{label}</Text>
                </View>
                <View className="flex-row items-center">
                    {badge > 0 && (
                        <View className="bg-danger-500 rounded-full px-1.5 py-0.5 mr-2">
                            <Text className="text-[10px] font-black text-white">{badge}</Text>
                        </View>
                    )}
                    <ChevronRightIcon size={16} color="#9ca3af" />
                </View>
            </>
        )}
    </Pressable>
);

const LanguageButton = ({ active, onPress, icon, label, themeColors }: any) => (
    <Pressable 
        onPress={onPress}
        className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border-2 active:opacity-70 ${
            active 
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-600' 
                : 'bg-secondary-50 dark:bg-secondary-900 border-secondary-100 dark:border-secondary-700'
        }`}
        style={active ? { borderColor: themeColors.primary600 } : {}}
    >
        {icon}
        <Text className={`ml-2 font-black text-xs ${active ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500'}`}>
            {label}
        </Text>
    </Pressable>
);
