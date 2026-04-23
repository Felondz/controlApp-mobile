import { useWindowDimensions, View, Text, Pressable, ScrollView, AppState, AppStateStatus } from "react-native";
import { useState, memo, useMemo, useCallback, useEffect } from "react";
import { Tabs, useRouter, usePathname, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme, useTranslate } from "../../src/shared/hooks";
import { useProjectStore } from "../../src/stores/projectStore";
import { useAuthStore } from "../../src/stores/authStore";
import { useDashboardStore } from "../../src/stores/dashboardStore";
import { 
    DashboardIcon, 
    Cog6ToothIcon,
    PuzzleIcon,
    EnvelopeIcon,
    BugIcon,
    SearchIcon,
    ChevronLeftIcon,
    Bars3Icon,
    ChatIcon,
    CheckListIcon,
    CurrencyDollarIcon,
    FolderIcon,
    EllipsisHorizontalIcon,
    PackageIcon,
    FactoryIcon,
    UserIcon,
    ToolboxIcon,
    CalculatorIcon
} from "../../src/shared/icons";
import { ApplicationLogo } from "../../src/shared/components/ApplicationLogo";
import { ThemeToggle } from "../../src/shared/components/ThemeToggle";
import { AccountDropdown } from "../../src/shared/components/AccountDropdown";
import { BugReporterWidget } from "../../src/shared/components/BugReporterWidget";
import { SearchOverlay } from "../../src/shared/components/SearchOverlay";
import { Modal } from "../../src/shared/components/Modal";
import { getEcho } from "../../src/services/echo";
import { apolloClient } from "../../src/services/graphql/client";
import { AppImage } from "../../src/shared/components/media/AppImage";
import { resolveImageUrl } from "../../src/shared/utils/image";

// --- NAVIGATION SHEET (SUBMENU) ---

const NavigationSheet = ({ visible, onClose, activeProject, t, router, theme, insets, type = 'modules', user }: any) => {
    const modules = useMemo(() => (activeProject?.modules || []).map((m: string) => m.toLowerCase()), [activeProject]);
    
    const activeTools = useMemo(() => {
        const tools = [];
        if (user?.enabled_tools?.includes('calculator')) {
            tools.push({ id: 'calculator', label: t('tools.financial_calculator'), icon: CalculatorIcon, href: '/(app)/tools/calculator' });
        }
        return tools;
    }, [user, t]);

    const renderIconItem = (key: string, label: string, Icon: any, href: string) => (
        <Pressable 
            key={key}
            onPress={() => { router.push(href); onClose(); }}
            className="w-1/4 items-center justify-center mb-8 active:opacity-60"
        >
            <View className="w-12 h-12 items-center justify-center rounded-2xl bg-secondary-100 dark:bg-secondary-800/80 mb-2">
                <Icon size={24} color={theme.primary600} />
            </View>
            <Text className="text-[10px] font-bold text-secondary-500 dark:text-secondary-400 text-center tracking-tighter" numberOfLines={1}>
                {label}
            </Text>
        </Pressable>
    );

    const isModules = type === 'modules';

    return (
        <Modal 
            visible={visible} 
            onClose={onClose} 
            title={isModules ? t('modules.title', 'Módulos') : t('dashboard.tools', 'Herramientas')} 
            size="lg"
            headerTextColor={theme.primary600}
        >
            <View className="px-2 pt-6 bg-white dark:bg-secondary-900" style={{ paddingBottom: insets.bottom + 20 }}>
                {isModules && activeProject && (
                    <>
                        <View className="flex-row items-center mb-6 ml-2">
                            <View className="w-1 h-4 rounded-full bg-primary-600 mr-2" style={{ backgroundColor: theme.primary600 }} />
                            <Text className="text-[11px] font-black uppercase tracking-[2px] text-secondary-400 dark:text-secondary-500">
                                {t('projects.modules.available')}
                            </Text>
                        </View>
                        <View className="flex-row flex-wrap">
                            {modules.includes('finance') && renderIconItem('fin', t('finance.title'), CurrencyDollarIcon, '/(app)/finance')}
                            {modules.includes('tasks') && renderIconItem('tsk', t('tasks.title'), CheckListIcon, '/(app)/tasks')}
                            {modules.includes('inventory') && renderIconItem('inv', t('inventory.title'), PackageIcon, '/(app)/inventory')}
                            {modules.includes('operations') && renderIconItem('ops', t('operations.title'), FactoryIcon, '/(app)/operations')}
                            {modules.includes('chat') && renderIconItem('cht', t('chat.title'), ChatIcon, '/(app)/chat')}
                        </View>
                    </>
                )}

                {!isModules && activeTools.length > 0 && (
                    <>
                        <View className="flex-row items-center mb-6 ml-2">
                            <View className="w-1 h-4 rounded-full bg-primary-600 mr-2" style={{ backgroundColor: theme.primary600 }} />
                            <Text className="text-[11px] font-black uppercase tracking-[2px] text-secondary-400 dark:text-secondary-500">
                                {t('dashboard.tools')}
                            </Text>
                        </View>
                        <View className="flex-row flex-wrap">
                            {activeTools.map(tool => renderIconItem(tool.id, tool.label, tool.icon, tool.href))}
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
};

// --- MAIN LAYOUT ---

export default function AppLayout() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isDesktop = width >= 1024;
    const isTablet = width >= 768 && width < 1024;
    const isPortrait = height > width;

    const { theme, isDark } = useAppTheme();
    const { activeProject, setActiveProject, clearActiveProject } = useProjectStore();
    const { fetchProjects } = useDashboardStore();
    const { user } = useAuthStore();
    const { t } = useTranslate();
    const router = useRouter();
    const pathname = usePathname();
    const segments = useSegments();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showNavSheet, setShowNavSheet] = useState(false);
    const [showToolsSheet, setShowToolsSheet] = useState(false);
    const [showBugReporter, setShowBugReporter] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [accountBtnLayout, setAccountBtnLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const userProfileImage = useMemo(() => resolveImageUrl(user?.profile_photo_url), [user?.profile_photo_url]);

    // REAL-TIME SYNC & APP STATE
    useEffect(() => {
        let echo: any = null;
        if (!user) return;

        const setupEcho = async () => {
            try {
                const { setUser } = useAuthStore.getState();
                echo = await getEcho();
                echo.private(`App.Models.User.${user.id}`)
                    .listen('.ProjectUpdated', (e: any) => {
                        console.log('[Realtime] Project Updated:', e?.project?.nombre);
                        const { fetchProjects } = useDashboardStore.getState();
                        const { activeProject, setActiveProject } = useProjectStore.getState();
                        
                        fetchProjects();
                        if (activeProject && e.project && activeProject.id === e.project.id) {
                            setActiveProject(e.project);
                            apolloClient.refetchQueries({ include: "active" }).catch(err => 
                                console.warn('Apollo refetch error:', err)
                            );
                        }
                    })
                    .listen('.UserUpdated', (e: any) => {
                        console.log('[Realtime] User Profile/Tools Updated (namespaced)');
                        if (e.user) {
                            setUser(e.user);
                        } else {
                            useAuthStore.getState().fetchUser();
                        }
                    })
                    .listen('UserUpdated', (e: any) => {
                        console.log('[Realtime] User Profile/Tools Updated (global)');
                        if (e.user) {
                            setUser(e.user);
                        } else {
                            useAuthStore.getState().fetchUser();
                        }
                    })
                    .listen('.InvitationReceived', (e: any) => {
                        console.log('[Realtime] Invitation Received');
                        const { fetchProjects } = useDashboardStore.getState();
                        fetchProjects();
                        apolloClient.refetchQueries({ include: "active" }).catch(err => 
                            console.warn('Apollo refetch error:', err)
                        );
                    })
                    .listen('.ProjectDeleted', (e: any) => {
                        console.log('[Realtime] Project Deleted:', e.projectId);
                        const { fetchProjects } = useDashboardStore.getState();
                        const { activeProject, clearActiveProject } = useProjectStore.getState();
                        
                        fetchProjects();
                        if (activeProject && activeProject.id === e.projectId) {
                            clearActiveProject();
                            router.replace('/(app)');
                        }
                    });
            } catch (err) { console.warn('Sync error:', err); }
        };

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                console.log('[AppState] App focused, refetching data...');
                apolloClient.refetchQueries({ include: "active" }).catch(err => 
                    console.warn('Apollo refetch error:', err)
                );
                useDashboardStore.getState().fetchProjects();
                useAuthStore.getState().fetchUser();
            }
        };

        setupEcho();
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => { 
            if (echo) echo.leave(`App.Models.User.${user.id}`); 
            subscription.remove();
        };
    }, [user]);

    const headerBg = isDark ? '#111827' : '#ffffff';
    const borderColor = isDark ? '#1f2937' : '#f3f4f6';

    const handleExit = () => { clearActiveProject(); router.push('/(app)'); };

    const activeTools = useMemo(() => {
        const tools = [];
        if (user?.enabled_tools?.includes('calculator')) {
            tools.push({ name: 'calculator', label: t('tools.financial_calculator'), icon: CalculatorIcon, href: '/(app)/tools/calculator' });
        }
        return tools;
    }, [user, t]);

    const showToolsButton = activeTools.length > 0;

    const getIconColor = useCallback((type: string) => {
        const current = pathname.replace(/^\//, '') || 'index';
        const inactive = isDark ? '#6b7280' : '#9ca3af';
        
        if (activeProject) {
            if (type === 'home') return inactive; 
            if (type === 'overview') return current === 'index' ? theme.primary600 : inactive;
            if (type === 'settings') return (current.includes('settings') || current.includes('edit')) ? theme.primary600 : inactive;
            return inactive;
        }
        
        if (type === 'home') return current === 'index' ? theme.primary600 : inactive;
        if (type === 'marketplace') return current.includes('marketplace') ? theme.primary600 : inactive;
        if (type === 'invitations') return current.includes('invitations') ? theme.primary600 : inactive;
        if (type === 'settings') return current.includes('settings') ? theme.primary600 : inactive;
        return inactive;
    }, [pathname, activeProject, isDark, theme]);

    const sidebarSections = useMemo(() => {
        const current = pathname.replace(/^\//, '') || 'index';
        if (activeProject) {
            const mods = (activeProject.modules || []).map((m: string) => m.toLowerCase());
            return {
                main: [
                    { name: 'exit', label: t('dashboard.title'), icon: DashboardIcon, action: handleExit, active: false },
                    { name: 'overview', label: t('dashboard.overview'), icon: FolderIcon, href: '/(app)', active: current === 'index' },
                    ...(mods.includes('finance') ? [{ name: 'finance', label: t('finance.title'), icon: CurrencyDollarIcon, href: '/(app)/finance', active: current.includes('finance') }] : []),
                    ...(mods.includes('tasks') ? [{ name: 'tasks', label: t('tasks.title'), icon: CheckListIcon, href: '/(app)/tasks', active: current.includes('tasks') }] : []),
                    ...(mods.includes('inventory') ? [{ name: 'inventory', label: t('inventory.title'), icon: PackageIcon, href: '/(app)/inventory', active: current.includes('inventory') }] : []),
                    ...(mods.includes('operations') ? [{ name: 'operations', label: t('operations.title'), icon: FactoryIcon, href: '/(app)/operations', active: current.includes('operations') }] : []),
                    ...(mods.includes('chat') ? [{ name: 'chat', label: t('chat.title'), icon: ChatIcon, href: '/(app)/chat', active: current.includes('chat') }] : []),
                ],
                tools: activeTools,
                footer: [{ name: 'settings', label: t('projects.settings'), icon: Cog6ToothIcon, href: '/(app)/projects/edit', active: current.includes('edit') }]
            };
        }
        return {
            main: [
                { name: 'index', label: t('dashboard.title'), icon: DashboardIcon, href: '/(app)', active: current === 'index' },
                { name: 'marketplace', label: t('modules.marketplace.title'), icon: PuzzleIcon, href: '/(app)/marketplace', active: current.includes('marketplace') },
                { name: 'invitations', label: t('modules.invitations.title'), icon: EnvelopeIcon, href: '/(app)/invitations', active: current.includes('invitations') },
            ],
            tools: activeTools,
            footer: [{ name: 'settings', label: t('settings.title'), icon: Cog6ToothIcon, href: '/(app)/settings', active: current.includes('settings') }]
        };
    }, [activeProject, pathname, t, activeTools]);

    const getRouteTitle = () => {
        if (pathname.includes('marketplace')) return t('modules.marketplace.title', 'Mercado');
        if (pathname.includes('invitations')) return t('modules.invitations.title', 'Invitaciones');
        if (pathname.includes('finance')) return t('finance.title', 'Finanzas');
        if (pathname.includes('tasks')) return t('tasks.title', 'Tareas');
        if (pathname.includes('chat')) return t('chat.title', 'Chat');
        if (pathname.includes('inventory')) return t('inventory.title', 'Inventario');
        if (pathname.includes('operations')) return t('operations.title', 'Operaciones');
        if (pathname.includes('settings')) return activeProject ? t('projects.settings', 'Ajustes del Proyecto') : t('settings.title', 'Ajustes');
        if (pathname.includes('projects/edit')) return t('projects.edit_project', 'Editar Proyecto');
        if (activeProject) return activeProject.nombre;
        return t('dashboard.title', 'Inicio');
    };

    const showSidebar = isDesktop || (isTablet && isPortrait);

    return (
        <View className="flex-1 flex-row bg-secondary-50 dark:bg-secondary-950">
            {showSidebar && (
                <View style={{ width: isSidebarCollapsed ? 80 : 280, backgroundColor: headerBg, borderRightColor: borderColor, borderRightWidth: 1, paddingTop: insets.top + 16 }}>
                    <View className="px-6 mb-10"><Pressable onPress={handleExit}><ApplicationLogo size={isSidebarCollapsed ? 28 : 36} showText={!isSidebarCollapsed} /></Pressable></View>
                    <ScrollView className="flex-1 px-3">
                        <View className="flex-1">
                            {sidebarSections.main.map((item: any) => (
                                <Pressable key={item.name} onPress={() => item.action ? item.action() : router.push(item.href)} className={`flex-row items-center rounded-2xl mb-1 px-4 py-3 ${item.active ? 'bg-primary-500/10' : ''}`}>
                                    <item.icon size={22} color={item.active ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                                    {!isSidebarCollapsed && <Text className={`font-bold ml-4 ${item.active ? 'text-secondary-900 dark:text-white' : 'text-secondary-500'}`}>{item.label}</Text>}
                                </Pressable>
                            ))}
                            {showToolsButton && (
                                <View className="mt-8 pt-6 border-t border-secondary-100 dark:border-secondary-800">
                                    {!isSidebarCollapsed && <Text className="px-4 mb-4 text-[10px] font-black uppercase tracking-[2px] text-secondary-400">{t('dashboard.tools')}</Text>}
                                    {activeTools.map((tool: any) => (
                                        <Pressable key={tool.id} onPress={() => router.push(tool.href)} className={`flex-row items-center rounded-2xl mb-1 px-4 py-3 ${pathname.includes(tool.href) ? 'bg-primary-500/10' : ''}`}>
                                            <tool.icon size={22} color={pathname.includes(tool.href) ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                                            {!isSidebarCollapsed && <Text className={`font-bold ml-4 ${pathname.includes(tool.href) ? 'text-secondary-900 dark:text-white' : 'text-secondary-500'}`}>{tool.label}</Text>}
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                            <View className="mt-auto pb-4">
                                {sidebarSections.footer.map((item: any) => (
                                    <Pressable key={item.name} onPress={() => router.push(item.href)} className={`flex-row items-center rounded-2xl mb-1 px-4 py-3 ${item.active ? 'bg-primary-500/10' : ''}`}>
                                        <item.icon size={22} color={item.active ? theme.primary600 : (isDark ? '#9ca3af' : '#6b7280')} />
                                        {!isSidebarCollapsed && <Text className={`font-bold ml-4 ${item.active ? 'text-secondary-900 dark:text-white' : 'text-secondary-500'}`}>{item.label}</Text>}
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            )}

            <View className="flex-1 flex-col">
                <View style={{ height: 70 + insets.top, paddingTop: insets.top, backgroundColor: headerBg, borderBottomColor: borderColor, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, zIndex: 40 }}>
                    <View className="flex-row items-center flex-1">
                        {showSidebar && <Pressable onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="mr-3"><Bars3Icon size={20} color={theme.primary600} /></Pressable>}
                        {(activeProject || segments.length > 1) && <Pressable onPress={() => router.canGoBack() ? router.back() : handleExit()} className="mr-3"><ChevronLeftIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} /></Pressable>}
                        <Text className="text-xl font-black tracking-tight" style={{ color: theme.primary600 }}>{getRouteTitle()}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Pressable onPress={() => setShowBugReporter(true)} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl"><BugIcon size={20} color="#ef4444" /></Pressable>
                        <Pressable onPress={() => setShowSearch(true)} className="p-2 bg-secondary-50 dark:bg-secondary-800 rounded-xl"><SearchIcon size={20} color={theme.primary600} /></Pressable>
                        <ThemeToggle />
                        <Pressable onPress={() => setShowAccountMenu(true)} onLayout={e => setAccountBtnLayout(e.nativeEvent.layout)}>
                            <View className="w-9 h-9 rounded-xl items-center justify-center overflow-hidden" style={{ backgroundColor: theme.primary600 }}>
                                {userProfileImage ? (
                                    <AppImage source={{ uri: userProfileImage }} contentFit="cover" />
                                ) : (
                                    <UserIcon size={20} color="white" />
                                )}
                            </View>
                        </Pressable>
                    </View>
                </View>

                <View className="flex-1">
                    <Tabs screenOptions={{
                        headerShown: false,
                        tabBarShowLabel: false,
                        tabBarStyle: {
                            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            borderTopColor: borderColor,
                            display: showSidebar ? 'none' : 'flex',
                            height: 65 + insets.bottom / 2,
                            elevation: 0,
                            borderTopWidth: 1,
                            paddingBottom: insets.bottom / 2,
                            paddingTop: 10,
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                        }
                    }}>
                        <Tabs.Screen name="index" options={{ 
                            tabBarIcon: ({ color }) => <DashboardIcon size={26} color={getIconColor('home')} />,
                            tabBarButton: (props) => <Pressable {...props} onPress={() => { if (activeProject) handleExit(); else router.push('/(app)'); }} />
                        }} />
                        <Tabs.Screen name="marketplace/index" options={{ 
                            tabBarIcon: ({ color }) => activeProject ? <FolderIcon size={26} color={getIconColor('overview')} /> : <PuzzleIcon size={26} color={getIconColor('marketplace')} />,
                            tabBarButton: (props) => <Pressable {...props} onPress={() => router.push(activeProject ? '/(app)' : '/(app)/marketplace')} />
                        }} />
                        <Tabs.Screen name="invitations" options={{ 
                            tabBarIcon: ({ color }) => activeProject ? <EllipsisHorizontalIcon size={32} color={getIconColor('modules')} /> : <EnvelopeIcon size={26} color={getIconColor('invitations')} />,
                            tabBarButton: (props) => (
                                <Pressable 
                                    {...props} 
                                    onPress={() => activeProject ? setShowNavSheet(true) : router.push('/(app)/invitations')} 
                                />
                            )
                        }} />
                        
                        <Tabs.Screen name="profile" options={{ 
                            tabBarIcon: ({ color }) => <ToolboxIcon size={26} color={isDark ? '#6b7280' : '#9ca3af'} />,
                            tabBarButton: (props) => showToolsButton ? <Pressable {...props} onPress={() => setShowToolsSheet(true)} /> : null,
                            tabBarItemStyle: { display: showToolsButton ? 'flex' : 'none' }
                        }} />

                        <Tabs.Screen name="settings" options={{ 
                            tabBarIcon: ({ color }) => <Cog6ToothIcon size={26} color={getIconColor('settings')} />,
                            tabBarButton: (props) => (
                                <Pressable 
                                    {...props} 
                                    onPress={() => router.push(activeProject ? '/(app)/projects/edit' : '/(app)/settings')} 
                                />
                            )
                        }} />

                        <Tabs.Screen name="projects" options={{ href: null }} />
                        <Tabs.Screen name="chat" options={{ href: null }} />
                        <Tabs.Screen name="finance" options={{ href: null }} />
                        <Tabs.Screen name="tasks" options={{ href: null }} />
                        <Tabs.Screen name="inventory" options={{ href: null }} />
                        <Tabs.Screen name="operations" options={{ href: null }} />
                        <Tabs.Screen name="tools/calculator" options={{ href: null }} />
                    </Tabs>
                </View>
            </View>

            <AccountDropdown visible={showAccountMenu} onClose={() => setShowAccountMenu(false)} anchorLayout={accountBtnLayout} />
            <BugReporterWidget visible={showBugReporter} onClose={() => setShowBugReporter(false)} showFloatingButton={false} />
            <SearchOverlay visible={showSearch} onClose={() => setShowSearch(false)} />
            <NavigationSheet visible={showNavSheet} onClose={() => setShowNavSheet(false)} activeProject={activeProject} t={t} router={router} theme={theme} isDark={isDark} insets={insets} type="modules" />
            <NavigationSheet visible={showToolsSheet} onClose={() => setShowToolsSheet(false)} activeProject={activeProject} t={t} router={router} theme={theme} isDark={isDark} insets={insets} type="tools" user={user} />
        </View>
    );
}
