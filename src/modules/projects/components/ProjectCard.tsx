import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslate } from '../../../../src/shared/hooks';
import { getTheme } from '../../../../src/shared/themes';
import { useSettingsStore } from '../../../../src/stores/settingsStore';
import { FinanceQuickActions } from '../../../../src/shared/components';
import { resolveImageUrl } from '../../../../src/shared/utils/image';
import { AppImage } from '../../../../src/shared/components/media/AppImage';

// Widgets
import { BalanceWidget } from '../../finance/widgets/BalanceWidget';
import { InventorySummaryWidget } from '../../inventory/widgets/InventorySummaryWidget';
import { OperationsSummaryWidget } from '../../operations/widgets/OperationsSummaryWidget';
import { TasksSummaryWidget } from '../../tasks/widgets/TasksSummaryWidget';

// Icons
import {
    FolderIcon, PuzzleIcon, CalendarIcon, CalculatorIcon,
    CurrencyDollarIcon, CheckListIcon, ChatIcon, FactoryIcon,
    PackageIcon, UsersIcon, PersonalFinanceIcon, Bars3Icon
} from '../../../../src/shared/icons';

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
        const imageUrl = resolveImageUrl(
            project.image_url || project.imagen || project.image_path
        ) || (project.icon && (project.icon.startsWith('http') || project.icon.startsWith('/')) ? project.icon : null);

        if (imageUrl) {
            return (
                <View className="h-10 w-10 rounded-xl bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
                    <AppImage source={{ uri: imageUrl }} contentFit="cover" />
                </View>
            );
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
                    <BalanceWidget proyectoId={project.id} compact theme={theme} />
                )}
                {modules.includes('tasks') && (
                    <TasksSummaryWidget project={project} compact theme={theme} />
                )}
                {modules.includes('inventory') && (
                    <InventorySummaryWidget proyectoId={project.id} compact theme={theme} />
                )}
                {modules.includes('operations') && (
                    <OperationsSummaryWidget proyectoId={project.id} compact theme={theme} />
                )}
            </View>
        );
    };

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
                            style={{ color: theme.primary600 }}
                            numberOfLines={2}
                        >
                            {project.nombre}
                        </Text>
                        {project.descripcion && (
                            <Text className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mt-1" numberOfLines={1}>
                                {project.descripcion}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Module Icons (Clean style) */}
                <View className="flex-row gap-3 mb-4 flex-wrap">
                    {modules.map(mod => {
                        const Icon = getModuleIcon(mod, 18, theme.primary600);
                        if (!Icon) return null;
                        return (
                            <View key={mod}>
                                {Icon}
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
                    <FinanceQuickActions 
                        proyectoId={project.id}
                        className="pt-4 border-t border-secondary-100 dark:border-secondary-700"
                    />
                )}
            </View>
        </Pressable>
    );
};
