import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { getTheme } from "../../../../src/shared/themes";

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = getTheme("purple-modern");

    return (
        <>
            <Stack.Screen
                options={{
                    title: `Proyecto #${id}`,
                    headerStyle: { backgroundColor: theme.primary500 },
                    headerTintColor: "white",
                }}
            />
            <ScrollView className="flex-1 bg-gray-50">
                <View className="p-4">
                    {/* Project Header */}
                    <View
                        className="rounded-xl p-6 mb-4"
                        style={{ backgroundColor: theme.primary500 }}
                    >
                        <Text className="text-white text-2xl font-bold mb-2">
                            Proyecto #{id}
                        </Text>
                        <Text className="text-white/80">
                            Detalle del proyecto
                        </Text>
                    </View>

                    {/* Modules Grid */}
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Módulos
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        {[
                            { name: "Finanzas", color: "#10b981" },
                            { name: "Tareas", color: "#f59e0b" },
                            { name: "Inventario", color: "#3b82f6" },
                            { name: "Operaciones", color: "#8b5cf6" },
                        ].map((module) => (
                            <TouchableOpacity
                                key={module.name}
                                className="flex-1 min-w-[45%] p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
                            >
                                <View
                                    className="w-10 h-10 rounded-lg mb-3 items-center justify-center"
                                    style={{ backgroundColor: `${module.color}20` }}
                                >
                                    <View
                                        className="w-5 h-5 rounded"
                                        style={{ backgroundColor: module.color }}
                                    />
                                </View>
                                <Text className="text-gray-800 font-medium">{module.name}</Text>
                                <Text className="text-gray-500 text-sm mt-1">Ver más →</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Placeholder */}
                    <View className="bg-white rounded-xl p-6 mt-4 items-center border border-gray-100">
                        <Text className="text-gray-400 text-center">
                            Los widgets del proyecto se mostrarán aquí.{"\n"}
                            Implementación en progreso.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
