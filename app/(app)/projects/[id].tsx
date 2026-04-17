import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { getTheme } from "../../../src/shared/themes";
import { useTranslate } from "../../../src/shared/hooks";

// Widgets
import { BalanceWidget } from '../../../src/modules/finance/widgets/BalanceWidget';
import { TasksSummaryWidget } from '../../../src/modules/tasks/widgets/TasksSummaryWidget';
import { ChatWidget } from '../../../src/modules/chat/widgets/ChatWidget';
import { InventorySummaryWidget } from '../../../src/modules/inventory/widgets/InventorySummaryWidget';
import { OperationsSummaryWidget } from '../../../src/modules/operations/widgets/OperationsSummaryWidget';

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = getTheme("purple-modern");
    const { t } = useTranslate();
    const router = useRouter();
    const proyectoId = parseInt(id);

    return (
        <>
            <Stack.Screen
                options={{
                    title: `Proyecto #${id}`,
                    headerStyle: { backgroundColor: theme.primary500 },
                    headerTintColor: "white",
                }}
            />
            <ScrollView className="flex-1 bg-secondary-50 dark:bg-secondary-950" showsVerticalScrollIndicator={false}>
                <View className="p-4 gap-6">
                    {/* Project Header */}
                    <View
                        className="rounded-3xl p-6 shadow-sm border border-white/10"
                        style={{ backgroundColor: theme.primary500 }}
                    >
                        <Text className="text-white text-2xl font-black mb-1">
                            Proyecto #{id}
                        </Text>
                        <Text className="text-white/80 font-medium">
                            {t('dashboard.overview', 'Resumen del proyecto')}
                        </Text>
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
                                { name: "Finanzas", color: "#10b981", href: "/(app)/finance" },
                                { name: "Tareas", color: "#f59e0b", href: "/(app)/tasks" },
                                { name: "Inventario", color: "#3b82f6", href: "/(app)/inventory" },
                                { name: "Operaciones", color: "#8b5cf6", href: "/(app)/operations" },
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
                                        <View
                                            className="w-6 h-6 rounded-lg"
                                            style={{ backgroundColor: module.color }}
                                        />
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
