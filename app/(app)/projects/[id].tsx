import { View, Text, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { getTheme } from "../../../src/shared/themes";
import { useTranslate, useAppTheme } from "../../../src/shared/hooks";
import { UsersIcon, CogIcon } from "../../../src/shared/icons";

// Widgets
import { BalanceWidget } from '../../../src/modules/finance/widgets/BalanceWidget';
import { TasksSummaryWidget } from '../../../src/modules/tasks/widgets/TasksSummaryWidget';
import { ChatWidget } from '../../../src/modules/chat/widgets/ChatWidget';
import { InventorySummaryWidget } from '../../../src/modules/inventory/widgets/InventorySummaryWidget';
import { OperationsSummaryWidget } from '../../../src/modules/operations/widgets/OperationsSummaryWidget';

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme: appTheme, isDark } = useAppTheme();
    const theme = getTheme("purple-modern");
    const { t } = useTranslate();
    const router = useRouter();
    const proyectoId = id;

    return (
        <>
            <Stack.Screen
                options={{
                    title: `Proyecto #${id}`,
                    headerStyle: { backgroundColor: theme.primary500 },
                    headerTintColor: "white",
                    headerRight: () => (
                        <TouchableOpacity 
                            onPress={() => router.push(`/(app)/projects/${id}/members`)}
                            className="mr-2"
                        >
                            <UsersIcon size={24} color="white" />
                        </TouchableOpacity>
                    )
                }}
            />
            <ScrollView className="flex-1 bg-secondary-50 dark:bg-secondary-950" showsVerticalScrollIndicator={false}>
                <View className="p-4 gap-6">
                    {/* Project Header */}
                    <View
                        className="rounded-3xl p-6 shadow-sm border border-white/10"
                        style={{ backgroundColor: theme.primary500 }}
                    >
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                                <Text className="text-white text-2xl font-black mb-1">
                                    Proyecto #{id}
                                </Text>
                                <Text className="text-white/80 font-medium">
                                    {t('dashboard.overview', 'Resumen del proyecto')}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => router.push(`/(app)/projects/edit?id=${id}`)}
                                className="bg-white/20 p-2 rounded-xl"
                            >
                                <CogIcon size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Dashboard Widgets */}
                    <BalanceWidget proyectoId={proyectoId} />
                    
                    <TasksSummaryWidget project={{ id: proyectoId }} />

                    <ChatWidget 
                        projectId={proyectoId} 
                        onPress={() => router.push('/(app)/chat')}
                    />

                    <InventorySummaryWidget proyectoId={proyectoId} />

                    <OperationsSummaryWidget proyectoId={proyectoId} />

                    {/* Modules Quick Grid */}
                    <View>
                        <Text className="text-lg font-black text-secondary-900 dark:text-white mb-4 ml-1">
                            {t('dashboard.modules', 'Módulos')}
                        </Text>
                        <View className="flex-row flex-wrap gap-3">
                            {[
                                { name: "Finanzas", color: "#10b981", icon: "💰", href: "/(app)/finance" },
                                { name: "Tareas", color: "#f59e0b", icon: "📋", href: "/(app)/tasks" },
                                { name: "Inventario", color: "#3b82f6", icon: "📦", href: "/(app)/inventory" },
                                { name: "Operaciones", color: "#8b5cf6", icon: "⚙️", href: "/(app)/operations" },
                                { name: "Miembros", color: "#6366f1", icon: "👥", href: `/(app)/projects/${id}/members` },
                                { name: "Ajustes", color: "#6b7280", icon: "🛠️", href: `/(app)/projects/edit?id=${id}` },
                            ].map((module) => (
                                <Pressable
                                    key={module.name}
                                    onPress={() => router.push(module.href as any)}
                                    className="flex-1 min-w-[45%] p-5 rounded-3xl bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-800 shadow-sm active:bg-secondary-50 dark:active:bg-secondary-800 active:scale-95 transition-all"
                                >
                                    <View
                                        className="w-12 h-12 rounded-2xl mb-4 items-center justify-center"
                                        style={{ backgroundColor: `${module.color}20` }}
                                    >
                                        <Text className="text-xl">{module.icon}</Text>
                                    </View>
                                    <Text className="text-secondary-900 dark:text-white font-black uppercase tracking-widest text-sm">{module.name}</Text>
                                    <Text className="text-secondary-500 dark:text-secondary-400 text-sm mt-1">Ver más →</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
