import { useWindowDimensions, View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { useState, memo, useEffect } from "react";
import { Tabs, useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslate, useAppTheme } from "../../src/shared/hooks";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useProjectStore } from "../../src/stores/projectStore";
import { useAuthStore } from "../../src/stores/authStore";
import { ThemeToggle } from "../../src/shared/components/ThemeToggle";
import { AccountDropdown } from "../../src/shared/components/AccountDropdown";
import { BugReporterWidget } from "../../src/shared/components/BugReporterWidget";
import { SearchOverlay } from "../../src/shared/components/SearchOverlay";
import {
    DashboardIcon,
    FolderIcon,
    Cog6ToothIcon,
    CalculatorIcon,
    PackageIcon,
    FactoryIcon,
    PuzzleIcon,
    ChevronLeftIcon,
    PlusIcon,
    SearchIcon,
    EnvelopeIcon,
    UserIcon,
    BugIcon
} from "../../src/shared/icons";

import { ApplicationLogo } from "../../src/shared/components/ApplicationLogo";

const SidebarItem = memo(({ item, isActive, onPress, theme, isDark }: any) => {
    const Icon = item.icon;
    
    // Style configurations
    const activeBackground = isDark ? `${theme.primary900}40` : theme.primary100;
    const activeBorderColor = isDark ? theme.primary800 : theme.primary200;
    const activeTextColor = isDark ? "#ffffff" : theme.primary700;
    const inactiveTextColor = isDark ? "#9ca3af" : "#64748b";

    return (
        <View style={styles.itemWrapper}>
            <Pressable
                onPress={onPress}
                style={[
                    styles.itemContainer,
                    isActive ? {
                        backgroundColor: activeBackground,
                        borderColor: activeBorderColor,
                        borderWidth: 1,
                    } : styles.itemInactive
                ]}
            >
                <Icon
                    size={22}
                    color={isActive ? theme.primary600 : inactiveTextColor}
                    style={{ opacity: isActive ? 1 : 0.6 }}
                />
                <Text 
                    style={[
                        styles.itemText,
                        { color: isActive ? activeTextColor : inactiveTextColor },
                        isActive ? styles.fontBlack : styles.fontBold
                    ]}
                >
                    {item.label}
                </Text>
            </Pressable>
        </View>
    );
});

const styles = StyleSheet.create({
    itemWrapper: {
        paddingHorizontal: 12,
        paddingVertical: 2,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
    itemInactive: {
        borderColor: 'transparent',
        borderWidth: 1,
    },
    itemText: {
        marginLeft: 12,
        fontSize: 14,
    },
    fontBlack: {
        fontWeight: '900',
    },
    fontBold: {
        fontWeight: '700',
    }
});

export default function AppLayoutWrapper() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isDesktop = width >= 1024;
    const { theme, isDark } = useAppTheme();
    const { activeProject, clearActiveProject } = useProjectStore();
    const { user } = useAuthStore();
    const { t } = useTranslate();
    const router = useRouter();
    const pathname = usePathname();

    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showBugReporter, setShowBugReporter] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [accountBtnLayout, setAccountBtnLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const headerBg = isDark ? '#111827' : '#ffffff';
    const borderColor = isDark ? '#1f2937' : '#f3f4f6';

    const getNavItems = () => {
        if (activeProject) {
            return {
                main: [
                    { name: 'index', label: t('dashboard.title', 'Dashboard'), icon: DashboardIcon, href: '/(app)' },
                    { name: 'finance', label: t('finance.title', 'Finanzas'), icon: CalculatorIcon, href: '/(app)/finance' },
                    { name: 'inventory', label: t('inventory.title', 'Inventario'), icon: PackageIcon, href: '/(app)/inventory' },
                    { name: 'operations', label: t('operations.title', 'Operaciones'), icon: FactoryIcon, href: '/(app)/operations' },
                ],
                tools: [],
                footer: [
                    { name: 'settings', label: t('settings.title', 'Ajustes'), icon: Cog6ToothIcon, href: '/(app)/settings' },
                ]
            };
        }

        return {
            main: [
                { name: 'index', label: t('dashboard.title', 'Inicio'), icon: DashboardIcon, href: '/(app)' },
                { name: 'marketplace', label: t('modules.marketplace.title', 'Mercado'), icon: PuzzleIcon, href: '/(app)/marketplace' },
                { name: 'invitations', label: t('modules.invitations.title', 'Invitaciones'), icon: EnvelopeIcon, href: '/(app)/invitations' },
            ],
            tools: [
                { name: 'calculator', label: t('tools.financial_calculator', 'Calculadora'), icon: CalculatorIcon, href: '/(app)/tools/calculator' },
            ],
            footer: [
                { name: 'settings', label: t('settings.title', 'Ajustes'), icon: Cog6ToothIcon, href: '/(app)/settings' },
            ]
        };
    };

    const sections = getNavItems();
    const allNavItems = [...sections.main, ...sections.tools, ...sections.footer];
    
    // Normalize path for comparison
    const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

    const isItemActive = (href: string) => {
        // Handle Home/Index tab specifically
        if (href === '/(app)' || href === '/(app)/' || href === '/') {
            return normalizedPathname === '/';
        }
        
        // For other tabs, check if the current path starts with the tab's base route
        const cleanHref = href.replace(/\/\(app\)/, '').replace(/\/$/, '') || '/';
        return normalizedPathname.startsWith(cleanHref) && cleanHref !== '/';
    };

    // Determine dynamic title based on active route
    const currentNavItem = allNavItems.find(item => isItemActive(item.href));
    
    // Special handling for specific routes not in nav
    const getRouteTitle = () => {
        if (activeProject) return activeProject.nombre;
        if (pathname.includes('/projects/new')) return t('projects.new_project', 'Nuevo Proyecto');
        if (currentNavItem) return currentNavItem.label;
        return t('dashboard.title', 'Inicio');
    };

    const dynamicTitle = getRouteTitle();

    // Check if we should show back button based on path rather than router.canGoBack() during render
    // to avoid "Couldn't find a navigation context" error in parent layout
    const showBackButton = activeProject || pathname !== '/' && pathname !== '/(app)';

    const isVisible = (name: string) => allNavItems.some(item => item.name === name);

    const screenOptions = {
        headerShown: false,
        tabBarStyle: {
            backgroundColor: headerBg,
            borderTopColor: borderColor,
            elevation: 0,
            shadowOpacity: 0,
            display: (isDesktop ? 'none' : 'flex') as any,
            height: 65 + (isDesktop ? 0 : insets.bottom / 2),
            paddingBottom: isDesktop ? 10 : 10 + insets.bottom / 2,
        },
        tabBarActiveTintColor: theme.primary600,
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700' as const,
            marginTop: -4,
            marginBottom: 4,
        }
    };

    return (
        <View className="flex-1 flex-row bg-secondary-50 dark:bg-secondary-950">
            {/* DESKTOP SIDEBAR */}
            {isDesktop && (
                <View
                    className="w-72 bg-white dark:bg-secondary-900 pt-4 pb-4"
                    style={{ backgroundColor: headerBg, borderRightColor: borderColor, borderRightWidth: 1, paddingTop: insets.top + 16 }}
                >
                    <Pressable 
                        onPress={() => {
                            if (activeProject) clearActiveProject();
                            router.push('/(app)');
                        }}
                        className="px-8 mb-10 active:opacity-70"
                    >
                        <ApplicationLogo size={36} />
                    </Pressable>

                    <ScrollView className="flex-1 px-3">
                        {/* MAIN SECTION */}
                        <View className="mb-6">
                            {sections.main.map((item) => (
                                <SidebarItem 
                                    key={item.name}
                                    item={item}
                                    isActive={isItemActive(item.href)}
                                    onPress={() => router.push(item.href as any)}
                                    theme={theme}
                                    isDark={isDark}
                                />
                            ))}
                        </View>

                        {/* TOOLS SECTION */}
                        {sections.tools.length > 0 && (
                            <View className="mb-6">
                                <View className="px-4 mb-2 flex-row items-center gap-2">
                                    <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary600 }} />
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-secondary-500 dark:text-secondary-400">
                                        {t('dashboard.tools', 'Herramientas')}
                                    </Text>
                                </View>
                                {sections.tools.map((item) => (
                                    <SidebarItem 
                                        key={item.name}
                                        item={item}
                                        isActive={isItemActive(item.href)}
                                        onPress={() => router.push(item.href as any)}
                                        theme={theme}
                                        isDark={isDark}
                                    />
                                ))}
                            </View>
                        )}

                        {/* PROJECT CONTEXT SECTION */}
                        {activeProject && (
                            <View className="mb-6 px-1">
                                <View 
                                    className="px-4 py-5 rounded-[24px] border relative overflow-hidden"
                                    style={{ 
                                        backgroundColor: isDark ? theme.primary900 : theme.primary50,
                                        borderColor: isDark ? theme.primary800 : theme.primary100
                                    }}
                                >
                                    {/* Safe opacity overlay */}
                                    <View 
                                        className="absolute inset-0 bg-white dark:bg-black opacity-20" 
                                        pointerEvents="none"
                                    />
                                    
                                    <View className="z-10">
                                        <Text className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: theme.primary600 }}>
                                            {t('dashboard.current_project', 'Proyecto')}
                                        </Text>
                                        <Text className="font-black text-secondary-900 dark:text-secondary-50 text-lg" numberOfLines={1}>
                                            {activeProject.nombre}
                                        </Text>
                                        <Pressable
                                            onPress={() => clearActiveProject()}
                                            className="mt-3 flex-row items-center active:opacity-70"
                                        >
                                            <ChevronLeftIcon size={12} color={theme.primary600} />
                                            <Text className="ml-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: theme.primary600 }}>
                                                {t('common.exit', 'Salir')}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* FOOTER SECTION */}
                    <View className="px-3 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                        {sections.footer.map((item) => (
                            <SidebarItem 
                                key={item.name}
                                item={item}
                                isActive={isItemActive(item.href)}
                                onPress={() => router.push(item.href as any)}
                                theme={theme}
                                isDark={isDark}
                            />
                        ))}
                    </View>
                </View>
            )}

            <View className="flex-1">
                {/* TOP BAR */}
                <View 
                    className="flex-row items-center justify-between px-6 z-50 border-b" 
                    style={{ 
                        backgroundColor: headerBg, 
                        borderBottomColor: borderColor,
                        height: 75 + insets.top,
                        paddingTop: insets.top + 5
                    }}
                >
                    <View className="flex-row items-center flex-1">
                        {showBackButton && (
                            <Pressable 
                                onPress={() => {
                                    if (activeProject) clearActiveProject();
                                    else if (router.canGoBack()) router.back();
                                    else router.push('/(app)');
                                }} 
                                className="mr-4 p-2.5 bg-secondary-100 dark:bg-secondary-800 rounded-2xl active:opacity-70"
                            >
                                <ChevronLeftIcon size={20} color={theme.primary600} />
                            </Pressable>
                        )}
                        <View>
                            {activeProject && (
                                <Text className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: theme.primary600 }}>
                                    {t('dashboard.current_project', 'PROYECTO')}
                                </Text>
                            )}
                            <Text 
                                className="text-xl font-black tracking-tight" 
                                style={{ color: theme.primary600 }}
                                numberOfLines={1}
                            >
                                {dynamicTitle}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-3">
                        {/* Bug Tracker Trigger */}
                        <Pressable 
                            onPress={() => setShowBugReporter(true)}
                            className="p-2.5 rounded-2xl active:opacity-70 border border-transparent bg-red-50 dark:bg-red-900/20"
                        >
                            <BugIcon size={22} color="#ef4444" />
                        </Pressable>

                        <Pressable 
                            onPress={() => setShowSearch(true)}
                            className="p-2.5 rounded-2xl active:opacity-70 border border-transparent"
                            style={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb' }}
                        >
                            <SearchIcon size={22} color={theme.primary600} />
                        </Pressable>

                        <ThemeToggle />

                        <Pressable 
                            onPress={() => setShowAccountMenu(true)}
                            onLayout={(e) => {
                                const layout = e.nativeEvent.layout;
                                setTimeout(() => {
                                    setAccountBtnLayout({
                                        x: layout.x,
                                        y: layout.y,
                                        width: layout.width,
                                        height: layout.height
                                    });
                                }, 100);
                            }}
                            className="p-1.5 rounded-2xl border active:opacity-70"
                            style={{ 
                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                borderColor: borderColor
                            }}
                        >
                            <View className="w-9 h-9 rounded-xl items-center justify-center overflow-hidden" style={{ backgroundColor: theme.primary600 }}>
                                <UserIcon size={22} color="white" />
                            </View>
                        </Pressable>
                    </View>
                </View>

                <AccountDropdown 
                    visible={showAccountMenu}
                    onClose={() => setShowAccountMenu(false)}
                    anchorLayout={accountBtnLayout}
                />
                <BugReporterWidget 
                    visible={showBugReporter} 
                    onClose={() => setShowBugReporter(false)}
                    showFloatingButton={false}
                />
                <SearchOverlay 
                    visible={showSearch}
                    onClose={() => setShowSearch(false)}
                />

                <Tabs screenOptions={screenOptions}>
                    <Tabs.Screen name="index" options={{ title: t('dashboard.title', 'Inicio'), tabBarIcon: ({ color, size }) => <DashboardIcon color={color} size={size + 2} />, href: isVisible('index') ? '/(app)' : null }} />
                    <Tabs.Screen name="projects" options={{ title: t('projects.title', 'Proyectos'), tabBarIcon: ({ color, size }) => <FolderIcon color={color} size={size + 2} />, href: isVisible('projects') ? '/(app)/projects' : null }} />
                    <Tabs.Screen name="invitations" options={{ title: t('modules.invitations.title', 'Invitaciones'), tabBarIcon: ({ color, size }) => <EnvelopeIcon color={color} size={size + 2} />, href: isVisible('invitations') ? '/(app)/invitations' : null }} />
                    <Tabs.Screen name="marketplace" options={{ title: t('modules.marketplace.title', 'Mercado'), tabBarIcon: ({ color, size }) => <PuzzleIcon color={color} size={size + 2} />, href: isVisible('marketplace') ? '/(app)/marketplace' : null }} />
                    <Tabs.Screen name="finance" options={{ title: t('finance.title', 'Finanzas'), tabBarIcon: ({ color, size }) => <CalculatorIcon color={color} size={size + 2} />, href: isVisible('finance') ? '/(app)/finance' : null }} />
                    <Tabs.Screen name="inventory" options={{ title: t('inventory.title', 'Inventario'), tabBarIcon: ({ color, size }) => <PackageIcon color={color} size={size + 2} />, href: isVisible('inventory') ? '/(app)/inventory' : null }} />
                    <Tabs.Screen name="operations" options={{ title: t('operations.title', 'Operaciones'), tabBarIcon: ({ color, size }) => <FactoryIcon color={color} size={size + 2} />, href: isVisible('operations') ? '/(app)/operations' : null }} />
                    <Tabs.Screen name="settings" options={{ title: t('settings.title', 'Ajustes'), tabBarIcon: ({ color, size }) => <Cog6ToothIcon color={color} size={size + 2} />, href: isVisible('settings') ? '/(app)/settings' : null }} />
                </Tabs>
            </View>
        </View>
    );
}
