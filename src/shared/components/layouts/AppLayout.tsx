import React, { useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import {
    HomeIcon,
    FolderIcon,
    CalculatorIcon,
    PackageIcon,
    FactoryIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XIcon,
} from '../../icons';

export interface NavItem {
    name: string;
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    href: string;
}

const NAV_ITEMS: NavItem[] = [
    { name: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '/(app)' },
    { name: 'projects', label: 'Proyectos', icon: FolderIcon, href: '/(app)/projects' },
    { name: 'finance', label: 'Finanzas', icon: CalculatorIcon, href: '/(app)/finance' },
    { name: 'inventory', label: 'Inventario', icon: PackageIcon, href: '/(app)/inventory' },
    { name: 'operations', label: 'Operaciones', icon: FactoryIcon, href: '/(app)/operations' },
    { name: 'settings', label: 'Ajustes', icon: Cog6ToothIcon, href: '/(app)/settings' },
];

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isDesktop = width >= 1024;
    const isTablet = width >= 768 && width < 1024;

    const isActive = (href: string) => {
        if (href === '/(app)') {
            return pathname === '/(app)' || pathname === '/(app)/';
        }
        return pathname.startsWith(href);
    };

    const handleNavigation = (href: string) => {
        router.push(href as any);
        setSidebarOpen(false);
    };

    const NavContent = ({ vertical = false }: { vertical?: boolean }) => (
        <View className={vertical ? 'flex-col' : 'flex-row'}>
            {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                    <TouchableOpacity
                        key={item.name}
                        onPress={() => handleNavigation(item.href)}
                        className={`
                            ${vertical ? 'flex-row items-center px-4 py-3 mx-2 my-1' : 'flex-col items-center px-3 py-2'}
                            rounded-lg transition-colors duration-200
                            ${active
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                            }
                        `}
                    >
                        <Icon
                            size={vertical ? 20 : 24}
                            color={active ? 'rgb(var(--color-primary-600))' : 'currentColor'}
                        />
                        <Text
                            className={`
                                ${vertical ? 'ml-3 text-sm font-medium' : 'mt-1 text-xs'}
                                ${active ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-600 dark:text-secondary-400'}
                            `}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-secondary-50 dark:bg-secondary-900" edges={['top']}>
            <View className="flex-1 flex">
                {(isDesktop || isTablet) && (
                    <View className="hidden md:flex flex-row flex-1">
                        <View
                            className="
                                w-64 bg-white dark:bg-secondary-800
                                border-r border-secondary-200 dark:border-secondary-700
                                pt-4 pb-4
                            "
                        >
                            <View className="px-6 mb-6">
                                <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                    ControlApp
                                </Text>
                            </View>
                            <NavContent vertical />
                        </View>
                        <View className="flex-1 flex flex-col">
                            <View className="h-16 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 flex items-center">
                                <Text className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                                    {NAV_ITEMS.find((item) => isActive(item.href))?.label || 'App'}
                                </Text>
                            </View>
                            <ScrollView className="flex-1 p-6">{children}</ScrollView>
                        </View>
                    </View>
                )}

                {!isDesktop && !isTablet && (
                    <View className="flex-1 flex flex-col">
                        <View className="h-14 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-4 flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={() => setSidebarOpen(true)}
                                className="p-2 rounded-lg"
                            >
                                <Bars3Icon size={24} color="rgb(var(--color-secondary-600))" />
                            </TouchableOpacity>
                            <Text className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                                ControlApp
                            </Text>
                            <View className="w-10" />
                        </View>

                        <ScrollView className="flex-1 p-4 pb-24">{children}</ScrollView>

                        <View
                            className="
                                absolute bottom-0 left-0 right-0
                                bg-white dark:bg-secondary-800
                                border-t border-secondary-200 dark:border-secondary-700
                                px-2 pb-safe
                            "
                        >
                            <View className="flex-row justify-around py-2">
                                {NAV_ITEMS.slice(0, 5).map((item) => {
                                    const active = isActive(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <TouchableOpacity
                                            key={item.name}
                                            onPress={() => handleNavigation(item.href)}
                                            className={`
                                                flex-col items-center px-3 py-1
                                                rounded-lg transition-colors duration-200
                                                ${active
                                                    ? 'text-primary-600 dark:text-primary-400'
                                                    : 'text-secondary-500 dark:text-secondary-400'
                                                }
                                            `}
                                        >
                                            <Icon
                                                size={22}
                                                color={
                                                    active
                                                        ? 'rgb(var(--color-primary-600))'
                                                        : 'currentColor'
                                                }
                                            />
                                            <Text
                                                className={`
                                                    mt-0.5 text-[10px] font-medium
                                                    ${active
                                                        ? 'text-primary-600 dark:text-primary-400'
                                                        : 'text-secondary-500 dark:text-secondary-400'
                                                    }
                                                `}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                )}

                {sidebarOpen && !isDesktop && !isTablet && (
                    <View className="absolute inset-0 z-50">
                        <TouchableOpacity
                            className="absolute inset-0 bg-secondary-900/50"
                            onPress={() => setSidebarOpen(false)}
                            activeOpacity={1}
                        />
                        <View
                            className="
                                absolute left-0 top-0 bottom-0 w-72
                                bg-white dark:bg-secondary-800
                                shadow-xl
                            "
                        >
                            <View className="flex-row items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
                                <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                    ControlApp
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setSidebarOpen(false)}
                                    className="p-2"
                                >
                                    <XIcon size={20} color="rgb(var(--color-secondary-500))" />
                                </TouchableOpacity>
                            </View>
                            <View className="pt-4">
                                <NavContent vertical />
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
