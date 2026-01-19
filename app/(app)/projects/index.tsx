import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { getTheme } from "../../../src/shared/themes";

// Placeholder data - will be replaced with API call
const MOCK_PROJECTS = [
    { id: 1, nombre: "Proyecto Personal", theme: "purple-modern" },
    { id: 2, nombre: "Finanzas Hogar", theme: "forest-green" },
    { id: 3, nombre: "Emprendimiento", theme: "ocean-blue" },
];

export default function ProjectsListScreen() {
    const router = useRouter();
    const defaultTheme = getTheme("purple-modern");

    const renderProject = ({ item }: { item: typeof MOCK_PROJECTS[0] }) => {
        const theme = getTheme(item.theme);
        return (
            <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center"
                onPress={() => router.push(`/(app)/projects/${item.id}`)}
            >
                <View
                    className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                    style={{ backgroundColor: theme.primary100 }}
                >
                    <Text style={{ color: theme.primary600 }} className="text-xl font-bold">
                        {item.nombre.charAt(0)}
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 font-semibold text-base">{item.nombre}</Text>
                    <Text className="text-gray-500 text-sm">Proyecto activo</Text>
                </View>
                <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-gray-50 p-4">
            <FlatList
                data={MOCK_PROJECTS}
                renderItem={renderProject}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                    <View className="items-center py-12">
                        <Text className="text-gray-400 text-center">
                            No tienes proyectos aún.{"\n"}
                            Crea uno para empezar.
                        </Text>
                    </View>
                }
            />
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{ backgroundColor: defaultTheme.primary500 }}
            >
                <Text className="text-white text-2xl font-light">+</Text>
            </TouchableOpacity>
        </View>
    );
}
