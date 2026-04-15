import React, { useState } from 'react';
import { View, Text, Pressable, Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslate } from '../../../shared/hooks';
import { getTheme } from '../../../shared/themes';
import { useSettingsStore } from '../../../stores/settingsStore';
// Widgets
import { BalanceWidget } from '../../finance/widgets/BalanceWidget';
import { InventorySummaryWidget } from '../../inventory/widgets/InventorySummaryWidget';
import { OperationsSummaryWidget } from '../../operations/widgets/OperationsSummaryWidget';
import { TransactionModal } from '../../finance/widgets/TransactionModal';

// Icons
import {
    FolderIcon, PuzzleIcon, CalendarIcon, CalculatorIcon,
    CurrencyDollarIcon, CheckListIcon, ChatIcon, FactoryIcon,
    PackageIcon, UsersIcon, PersonalFinanceIcon, PlusIcon, MinusIcon, Bars3Icon
} from '../../../shared/icons';

// Types
interface Project {
    id: number;
    nombre: string;
    descripcion?: string;
    modules: string[];
    theme?: string;
    color?: string;
    image_url?: string;
    image_path?: string;
    imagen?: string;
    icon?: string;
    isAdmin?: boolean;
    es_personal?: boolean;
    unread_messages_count?: number;
}

interface ProjectCardProps {
    project: Project;
    dragHandleProps?: any;
    onPress?: () => void;
}

export const ProjectCard = ({ project, dragHandleProps, onPress }: ProjectCardProps) => {
    const { t } = useTranslate();
    const { isDark } = useSettingsStore();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const theme = getTheme(project.theme || 'purple-modern');
    
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'ingreso' | 'egreso'>('ingreso');
    
    const isTablet = width >= 768;

    let modules: string[] = ['finance'];
    try {
        if (Array.isArray(project.modules)) {
            modules = project.modules.map(m => m.toLowerCase());
        } else if (typeof project.modules === 'string') {
            const parsed = JSON.parse(project.modules);
            modules = Array.isArray(parsed) ? parsed.map(m => String(m).toLowerCase()) : ['finance'];
        }
    } catch (e) {
        modules = ['finance'];
    }

    const getModuleIcon = (moduleName: string, size = 14, color = '#6B7280') => {
        switch (moduleName) {
            case 'finance': return <CurrencyDollarIcon size={size} color={color} />;
            case 'tasks': return <CheckListIcon size={size} color={color} />;
            case 'chat': return <ChatIcon size={size} color={color} />;
            case 'marketplace': return <PuzzleIcon size={size} color={color} />;
            case 'inventory': return <PackageIcon size={size} color={color} />;
            case 'operations': return <FactoryIcon size={size} color={color} />;
            case 'crm': return <UsersIcon size={size} color={color} />;
            default: return null;
        }
    };

    const getProjectIcon = () => {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

        const imageUrl = project.image_url
            || project.imagen
            || (project.image_path ? `${baseUrl}/storage/${project.image_path}` : null)
            || (project.icon && (project.icon.startsWith('http') || project.icon.startsWith('/')) ? project.icon : null);

        if (imageUrl) {
            return <Image source={{ uri: imageUrl }} className="h-10 w-10 rounded-xl bg-gray-100" resizeMode="cover" />;
        }

        if (project.es_personal) {
            return <PersonalFinanceIcon size={40} color={theme.primary600} />;
        }

        const IconComponent = {
            'folder': FolderIcon,
            'puzzle': PuzzleIcon,
            'calendar': CalendarIcon,
            'calculator': CalculatorIcon,
            'finance': CurrencyDollarIcon,
            'tasks': CheckListIcon,
        }[project.icon || 'folder'] || FolderIcon;

        return <IconComponent size={40} color={theme.primary600} />;
    };

    const renderWidgets = () => {
        return (
            <View className="gap-3">
                {modules.includes('finance') && (
                    <BalanceWidget proyectoId={project.id} compact />
                )}
                {modules.includes('inventory') && (
                    <InventorySummaryWidget proyectoId={project.id} compact />
                )}
                {modules.includes('operations') && (
                    <OperationsSummaryWidget proyectoId={project.id} compact />
                )}
            </View>
        );
    };

    // Usamos el color personalizado del proyecto si existe, de lo contrario usamos el color del tema
    const cardColor = project.color || theme.primary600;

    return (
        <Pressable
            onPress={onPress}
            className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border overflow-hidden transition-all duration-200 active:scale-[0.98]"
            style={({ pressed }) => [
                { flex: 1, minHeight: 280, borderColor: isDark ? '#374151' : '#e5e7eb' },
                pressed ? { borderColor: theme.primary400, borderWidth: 2 } : { borderWidth: 1 }
            ]}
        >
            {/* Drag Handle */}
            {dragHandleProps && (
                <View
                    {...dragHandleProps}
                    className="absolute top-4 right-4 p-2 z-20 bg-white/80 dark:bg-secondary-900/80 rounded-full backdrop-blur-sm"
                >
                    <Bars3Icon size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                </View>
            )}

            <View className="p-5 flex-1">
                {/* Header */}
                <View className="flex-row items-start gap-3 mb-4">
                    <View className="flex-shrink-0">
                        {getProjectIcon()}
                    </View>
                    <View className="flex-1">
                        <Text 
                            className="text-base font-black tracking-tight leading-5" 
                            style={{ color: isDark ? theme.primary300 : theme.primary700 }}
                            numberOfLines={2}
                        >
                            {project.nombre}
                        </Text>
                        {project.descripcion && (
                            <Text className="text-[10px] font-medium text-secondary-500 dark:text-secondary-400 mt-1" numberOfLines={1}>
                                {project.descripcion}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Module Icons Badges */}
                <View className="flex-row gap-1.5 mb-4 flex-wrap">
                    {modules.map(mod => {
                        const Icon = getModuleIcon(mod, 12, theme.primary600);
                        if (!Icon) return null;
                        return (
                            <View 
                                key={mod} 
                                className="px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-900 border border-primary-100 dark:border-primary-800 flex-row items-center relative overflow-hidden"
                                style={{ backgroundColor: isDark ? theme.primary900 : theme.primary50, borderColor: isDark ? theme.primary700 : theme.primary100 }}
                            >
                                <View className="absolute inset-0 bg-white dark:bg-black opacity-20" pointerEvents="none" />
                                <View className="z-10">
                                    {Icon}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Widgets Body (Parity with web module summary) */}
                <View className="flex-1 mb-4">
                    {renderWidgets()}
                </View>

                {/* Footer Actions (Ingresos/Egresos) */}
                {modules.includes('finance') && project.isAdmin && (
                    <View className="pt-4 border-t border-secondary-100 dark:border-secondary-700 flex-row gap-2">
                        <Pressable
                            className="flex-1 flex-row items-center justify-center bg-green-50 dark:bg-green-900/20 py-2.5 rounded-xl border border-green-100 dark:border-green-800 active:opacity-70"
                            onPress={(e) => { e.stopPropagation(); setModalType('ingreso'); setModalVisible(true); }}
                        >
                            <PlusIcon size={12} color="#10b981" />
                            <Text className="text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest ml-1.5">
                                {t('finance.income')}
                            </Text>
                        </Pressable>
                        <Pressable
                            className="flex-1 flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 py-2.5 rounded-xl border border-red-100 dark:border-red-800 active:opacity-70"
                            onPress={(e) => { e.stopPropagation(); setModalType('egreso'); setModalVisible(true); }}
                        >
                            <MinusIcon size={12} color="#ef4444" />
                            <Text className="text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-widest ml-1.5">
                                {t('finance.expense')}
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>

            {modules.includes('finance') && project.isAdmin && (
                <TransactionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    proyectoId={project.id}
                    type={modalType}
                />
            )}
        </Pressable>
    );
};
