import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTranslate, useAppTheme } from '../hooks';
import { SearchIcon, XMarkIcon, FolderIcon, ChevronRightIcon } from '../icons';
import { searchApi } from '../../services/api';
import { useRouter } from 'expo-router';
import { useProjectStore, Proyecto } from '../../stores/projectStore';

interface SearchOverlayProps {
    visible: boolean;
    onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ visible, onClose }) => {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const { setActiveProject } = useProjectStore();
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (visible) {
            // Auto-focus input when modal opens
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            reset();
        }
    }, [visible]);

    const reset = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        setLoading(false);
    };

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 2) {
                handleSearch();
            } else {
                setResults([]);
                setHasSearched(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
            const response = await searchApi.search(query);
            // Assuming API returns results grouped by type or just projects
            // For now, let's filter just projects if multiple types come back
            const data = response.data;
            const projects = data.projects || data.data || [];
            setResults(projects);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProject = async (project: any) => {
        const proyecto: Proyecto = {
            id: project.id,
            nombre: project.nombre || project.name,
            descripcion: project.descripcion,
            modules: project.modules,
            theme: project.theme,
            image_url: project.image_url,
        };
        await setActiveProject(proyecto);
        onClose();
        router.push('/(app)');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-black/60"
            >
                <Pressable className="flex-1" onPress={onClose} />
                <View 
                    className="bg-white dark:bg-secondary-900 rounded-t-[40px] shadow-2xl overflow-hidden"
                    style={{ height: '80%' }}
                >
                    {/* Header/Search Input */}
                    <View className="px-6 py-6 border-b border-secondary-100 dark:border-secondary-800">
                        <View className="flex-row items-center bg-secondary-50 dark:bg-secondary-800 rounded-2xl px-4 py-3 border border-secondary-200 dark:border-secondary-700">
                            <SearchIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                            <TextInput
                                ref={inputRef}
                                className="flex-1 ml-3 text-secondary-900 dark:text-secondary-100 text-lg font-bold"
                                placeholder={t('common.search_placeholder', 'Buscar proyectos...')}
                                placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                value={query}
                                onChangeText={setQuery}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery('')}>
                                    <XMarkIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity 
                            onPress={onClose}
                            className="absolute top-2 right-6"
                        >
                            <View className="w-8 h-1 bg-secondary-200 dark:bg-secondary-700 rounded-full my-4 self-center" />
                        </TouchableOpacity>
                    </View>

                    {/* Results */}
                    <View className="flex-1 p-6">
                        {loading ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" color={theme.primary600} />
                                <Text className="mt-4 text-secondary-500 dark:text-secondary-400 font-medium">
                                    {t('common.searching', 'Buscando en Meilisearch...')}
                                </Text>
                            </View>
                        ) : results.length > 0 ? (
                            <FlatList
                                data={results}
                                keyExtractor={(item) => item.id.toString()}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleSelectProject(item)}
                                        activeOpacity={0.7}
                                        className="flex-row items-center p-4 bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-100 dark:border-secondary-700 mb-3 shadow-sm"
                                    >
                                        <View 
                                            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                                            style={{ backgroundColor: isDark ? theme.primary900 : theme.primary50 }}
                                        >
                                            <FolderIcon size={24} color={theme.primary600} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-secondary-900 dark:text-secondary-50 font-black text-base" numberOfLines={1}>
                                                {item.nombre || item.name}
                                            </Text>
                                            <Text className="text-secondary-500 dark:text-secondary-400 text-sm font-medium" numberOfLines={1}>
                                                {item.descripcion || t('projects.no_description')}
                                            </Text>
                                        </View>
                                        <ChevronRightIcon size={18} color={isDark ? '#4b5563' : '#d1d5db'} />
                                    </TouchableOpacity>
                                )}
                            />
                        ) : hasSearched && query.length >= 2 ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <View className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full items-center justify-center mb-4">
                                    <SearchIcon size={32} color={isDark ? '#4b5563' : '#9ca3af'} />
                                </View>
                                <Text className="text-lg font-bold text-secondary-900 dark:text-secondary-50">
                                    {t('common.no_results', 'No se encontraron resultados')}
                                </Text>
                                <Text className="text-secondary-500 dark:text-secondary-400 text-center mt-1 px-10">
                                    {t('common.no_results_desc', 'Prueba con otros términos de búsqueda.')}
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-1 items-center justify-center opacity-40">
                                <SearchIcon size={64} color={isDark ? '#374151' : '#e5e7eb'} />
                                <Text className="mt-4 text-center text-secondary-400 dark:text-secondary-600 font-bold uppercase tracking-widest text-sm">
                                    {t('common.type_to_search', 'Escribe algo para buscar')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
