import { useWindowDimensions, View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useState, memo, useMemo, useCallback, useEffect } from "react";
import { Tabs, useRouter, usePathname, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme, useTranslate } from "../../src/shared/hooks";
import { useProjectStore } from "../../src/stores/projectStore";
import { useAuthStore } from "../../src/stores/authStore";
import { 
    DashboardIcon, 
    CalculatorIcon, 
    PackageIcon, 
    FactoryIcon, 
    Cog6ToothIcon,
    PuzzleIcon,
    EnvelopeIcon,
    UserIcon,
    BugIcon,
    SearchIcon,
    ChevronLeftIcon,
    Bars3Icon,
    ChatIcon,
    CheckListIcon,
} from "../../src/shared/icons";
import { ApplicationLogo } from "../../src/shared/components/ApplicationLogo";
import { ThemeToggle } from "../../src/shared/components/ThemeToggle";
import { AccountDropdown } from "../../src/shared/components/AccountDropdown";
import { BugReporterWidget } from "../../src/shared/components/BugReporterWidget";
import { SearchOverlay } from "../../src/shared/components/SearchOverlay";

// --- SUB-COMPONENTS MEMOIZED FOR STABILITY ---

const SidebarItem = memo(({ item, isActive, onPress, theme, isDark }: any) => (
    <Pressable
        onPress={onPress}
        className={`flex-row items-center px-4 py-3 rounded-2xl mb-1 transition-all ${
            isActive 
                ? 'bg-primary-500/10' 
                : 'active:bg-secondary-100 dark:active:bg-secondary-800'
        }`}
    >
        <View className="mr-4">
            <item.icon 
                size={22} 
                color={isActive ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} 
            />
        </View>
        <Text className={`font-bold text-sm ${
            isActive ? 'text-secondary-900 dark:text-white' : 'text-secondary-500 dark:text-secondary-400'
        }`}>
            {item.label}
        </Text>
    </Pressable>
));

const NavContent = memo(({ sections, isItemActive, router, theme, isDark, vertical = false }: any) => (
    <View className={vertical ? "flex-1" : "flex-row gap-1"}>
        {sections.main.map((item: any) => (
            <SidebarItem 
                key={item.name}
                item={item}
                isActive={isItemActive(item.href)}
                onPress={() => router.push(item.href)}
                theme={theme}
                isDark={isDark}
            />
        ))}
        
        {sections.tools && sections.tools.length > 0 && (
            <View className={vertical ? "mt-6 pt-6 border-t border-secondary-100 dark:border-secondary-800" : "hidden"}>
                <Text className="px-4 mb-4 text-[10px] font-black uppercase tracking-widest text-secondary-400">
                    Herramientas
                </Text>
                {sections.tools.map((item: any) => (
                    <SidebarItem 
                        key={item.name}
                        item={item}
                        isActive={isItemActive(item.href)}
                        onPress={() => router.push(item.href)}
                        theme={theme}
                        isDark={isDark}
                    />
                ))}
            </View>
        )}

        <View className={vertical ? "mt-auto pb-4" : "hidden"}>
            {sections.footer.map((item: any) => (
                <SidebarItem 
                    key={item.name}
                    item={item}
                    isActive={isItemActive(item.href)}
                    onPress={() => router.push(item.href)}
                    theme={theme}
                    isDark={isDark}
                />
            ))}
        </View>
    </View>
));

const TabsContent = memo(({ theme, isDark, isDesktop, headerBg, borderColor, insets, t, activeProject }: any) => {
    // Determine which tabs to show based on context
    const visibleTabs = activeProject 
        ? ['index', 'tasks', 'finance', 'chat', 'inventory', 'operations', 'settings']
        : ['index', 'marketplace', 'invitations', 'settings'];

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.primary600,
            tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
            tabBarStyle: {
                backgroundColor: headerBg,
                borderTopColor: borderColor,
                display: isDesktop ? 'none' : 'flex',
                height: 65 + insets.bottom / 2,
                elevation: 0,
                borderTopWidth: 1,
            }
        }}>
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: activeProject ? t('dashboard.overview', 'Resumen') : t('dashboard.title', 'Inicio'),
                    href: '/(app)',
                    tabBarButton: visibleTabs.includes('index') ? undefined : () => null
                }} 
            />
            <Tabs.Screen 
                name="projects" 
                options={{ 
                    href: null, // Hidden from bottom tabs
                }} 
            />
            <Tabs.Screen 
                name="tasks" 
                options={{ 
                    title: t('tasks.title', 'Tareas'),
                    tabBarIcon: ({ color, size }) => <CheckListIcon size={size} color={color} />,
                    tabBarButton: visibleTabs.includes('tasks') ? undefined : () => null
                }} 
            />
            <Tabs.Screen 
                name="chat" 
                options={{ 
                    title: t('chat.title', 'Chat'),
                    tabBarIcon: ({ color, size }) => <ChatIcon size={size} color={color} />,
                    tabBarButton: visibleTabs.includes('chat') ? undefined : () => null
                }} 
            />
            <Tabs.Screen 
                name="invitations" 
                options={{ 
                    title: t('modules.invitations.title'),
                    tabBarButton: visibleTabs.includes('invitations') ? undefined : () => null
                }} 
            />
            <Tabs.Screen 
                name="marketplace" 
                options={{ 
                    title: t('modules.marketplace.title'),
                    tabBarButton: visibleTabs.includes('marketplace') ? undefined : () => null
                }} 
            />
            <Tabs.Screen 
                name="finance" 
                options={{ 
                    title: t('finance.title'),
                    tabBarButton: visibleTabs.includes('finance') ? undefined : () => null
                }} 
            />
            <Tabs.Screen 
                name="inventory" 
                options={{ 
                    title: t('inventory.title'),
                    tabBarButton: visibleTabs.includes('inventory') ? undefined : () => null
                }} 
            />
            <Tabs.Screen 
                name="operations" 
                options={{ 
                    title: t('operations.title'),
                    tabBarButton: visibleTabs.includes('operations') ? undefined : () => null
                }} 
            />
            <Tabs.Screen 
                name="settings" 
                options={{ 
                    title: t('settings.title'),
                    tabBarButton: visibleTabs.includes('settings') ? undefined : () => null
                }} 
            />
        </Tabs>
    );
});

// --- MAIN LAYOUT ---

export default function AppLayout() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isDesktop = width >= 1024;
    const isTablet = width >= 768 && width < 1024;
    
    const { theme, isDark } = useAppTheme();
    const { activeProject, clearActiveProject } = useProjectStore();
    const { user } = useAuthStore();
    const { t } = useTranslate();
    const router = useRouter();
    const segments = useSegments();
    const pathname = usePathname();

    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showBugReporter, setShowBugReporter] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [accountBtnLayout, setAccountBtnLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const headerBg = isDark ? '#111827' : '#ffffff';
    const borderColor = isDark ? '#1f2937' : '#f3f4f6';

    const sections = useMemo(() => {
        // Dynamic Tools from User Store
        const userTools = (user?.enabled_tools || []).map(toolKey => {
            // Mapping for tools
            if (toolKey === 'calculator') {
                return { name: 'calculator', label: t('tools.financial_calculator', 'Calculadora'), icon: CalculatorIcon, href: '/(app)/tools/calculator' };
            }
            return null;
        }).filter(Boolean);

        if (activeProject) {
            return {
                main: [
                    { name: 'overview', label: t('dashboard.overview', 'Resumen'), icon: DashboardIcon, href: '/(app)' },
                    { name: 'tasks', label: t('tasks.title', 'Tareas'), icon: CheckListIcon, href: '/(app)/tasks' },
                    { name: 'finance', label: t('finance.title', 'Finanzas'), icon: CalculatorIcon, href: '/(app)/finance' },
                    { name: 'chat', label: t('chat.title', 'Chat'), icon: ChatIcon, href: '/(app)/chat' },
                    { name: 'inventory', label: t('inventory.title', 'Inventario'), icon: PackageIcon, href: '/(app)/inventory' },
                    { name: 'operations', label: t('operations.title', 'Operaciones'), icon: FactoryIcon, href: '/(app)/operations' },
                ],
                tools: userTools,
                footer: [
                    { name: 'settings', label: t('projects.settings', 'Ajustes del Proyecto'), icon: Cog6ToothIcon, href: '/(app)/settings' }
                ]
            };
        }

        return {
            main: [
                { name: 'index', label: t('dashboard.title', 'Inicio'), icon: DashboardIcon, href: '/(app)' },
                { name: 'marketplace', label: t('modules.marketplace.title', 'Mercado'), icon: PuzzleIcon, href: '/(app)/marketplace' },
                { name: 'invitations', label: t('modules.invitations.title', 'Invitaciones'), icon: EnvelopeIcon, href: '/(app)/invitations' },
            ],
            tools: userTools,
            footer: [
                { name: 'settings', label: t('settings.title', 'Ajustes Globales'), icon: Cog6ToothIcon, href: '/(app)/settings' }
            ]
        };
    }, [activeProject, user?.enabled_tools, t]);

    const isItemActive = useCallback((href: string) => {
        const cleanHref = href.replace(/\/\(app\)/, '').replace(/^\//, '') || 'index';
        const currentRoute = segments[segments.length - 1] || 'index';
        return currentRoute === cleanHref || (currentRoute === 'index' && cleanHref === 'index');
    }, [segments]);

    const getRouteTitle = () => {
        if (activeProject) return activeProject.nombre;
        if (pathname.includes('projects/new')) return t('projects.new_project', 'Nuevo Proyecto');
        return t('dashboard.title', 'Inicio');
    };

    const showBackButton = activeProject || (segments.length > 1 && segments[segments.length - 1] !== 'index');

    const handleBack = () => {
        if (activeProject) {
            clearActiveProject();
            router.replace('/(app)');
        } else {
            router.back();
        }
    };

    return (
        <View className="flex-1 flex-row bg-secondary-50 dark:bg-secondary-950">
            {/* DESKTOP SIDEBAR */}
            {isDesktop && (
                <View
                    style={{ width: 280, backgroundColor: headerBg, borderRightColor: borderColor, borderRightWidth: 1, paddingTop: insets.top + 16 }}
                >
                    <Pressable onPress={() => router.push('/(app)')} className="px-8 mb-10 active:opacity-70">
                        <ApplicationLogo size={36} />
                    </Pressable>

                    <ScrollView className="flex-1 px-3" showsVerticalScrollIndicator={false}>
                        <NavContent 
                            sections={sections}
                            isItemActive={isItemActive}
                            router={router}
                            theme={theme}
                            isDark={isDark}
                            vertical
                        />
                    </ScrollView>
                </View>
            )}

            {/* MAIN CONTENT AREA */}
            <View className="flex-1 flex-col">
                {/* HEADER (TOP BAR) */}
                <View 
                    style={{ 
                        height: 70 + insets.top, 
                        paddingTop: insets.top,
                        backgroundColor: headerBg,
                        borderBottomColor: borderColor,
                        borderBottomWidth: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        zIndex: 40
                    }}
                >
                    <View className="flex-row items-center flex-1 mr-4">
                        {showBackButton ? (
                            <Pressable 
                                onPress={handleBack}
                                className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-800 items-center justify-center mr-3 active:scale-95 transition-all"
                            >
                                <ChevronLeftIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </Pressable>
                        ) : !isDesktop && (
                            <View className="mr-3">
                                <ApplicationLogo size={32} />
                            </View>
                        )}
                        <Text className="text-xl font-black tracking-tight text-secondary-900 dark:text-white" numberOfLines={1}>
                            {getRouteTitle()}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <Pressable onPress={() => setShowBugReporter(true)} className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-900/20 active:opacity-70">
                            <BugIcon size={20} color="#ef4444" />
                        </Pressable>
                        <Pressable onPress={() => setShowSearch(true)} className="p-2.5 rounded-2xl bg-secondary-50 dark:bg-secondary-800 active:opacity-70">
                            <SearchIcon size={20} color={theme.primary600} />
                        </Pressable>
                        <ThemeToggle />
                        <Pressable 
                            onPress={() => setShowAccountMenu(true)} 
                            onLayout={e => setAccountBtnLayout(e.nativeEvent.layout)}
                            className="p-1 rounded-xl border active:opacity-70"
                            style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: borderColor }}
                        >
                            <View className="w-8 h-8 rounded-lg items-center justify-center overflow-hidden" style={{ backgroundColor: theme.primary600 }}>
                                <UserIcon size={18} color="white" />
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* CONTENT (BOTTOM BAR via TABS) */}
                <View className="flex-1">
                    <TabsContent 
                        theme={theme} 
                        isDark={isDark} 
                        isDesktop={isDesktop} 
                        headerBg={headerBg} 
                        borderColor={borderColor} 
                        insets={insets} 
                        t={t} 
                        activeProject={activeProject}
                    />
                </View>

                {/* GLOBAL OVERLAYS */}
                <AccountDropdown visible={showAccountMenu} onClose={() => setShowAccountMenu(false)} anchorLayout={accountBtnLayout} />
                <BugReporterWidget visible={showBugReporter} onClose={() => setShowBugReporter(false)} showFloatingButton={false} />
                <SearchOverlay visible={showSearch} onClose={() => setShowSearch(false)} />
            </View>
        </View>
    );
}
