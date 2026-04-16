import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, useWindowDimensions, Pressable } from 'react-native';
import { FlashList } from "@shopify/flash-list";
// import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useInventoryItems, useDeleteInventoryItem, InventoryItem } from '../useInventory';
import { 
    PackageIcon, 
    PlusIcon, 
    SearchIcon, 
    FunnelIcon, 
    ExclamationTriangleIcon, 
    PencilIcon, 
    TrashIcon,
    XIcon,
    ChevronRightIcon
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import DangerButton from '../../../shared/components/DangerButton';
import Modal from '../../../shared/components/Modal';
import { SkeletonList } from '../../../shared/components/Skeleton';

interface InventoryListScreenProps {
    proyectoId: number;
    onAdd?: () => void;
    onEdit?: (item: InventoryItem) => void;
}

const getTypeBadgeStyle = (type: string, isDark: boolean) => {
    switch (type) {
        case 'raw_material':
            return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
        case 'finished_good':
            return isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
        case 'component':
            return isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800';
        case 'service':
            return isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800';
        case 'asset':
            return isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-800';
        default:
            return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
};

export default function InventoryListScreen({ proyectoId, onAdd, onEdit }: InventoryListScreenProps) {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModalItem, setDeleteModalItem] = useState<InventoryItem | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const isTablet = width >= 768;

    const { data, loading, refetch } = useInventoryItems(proyectoId, {
        name: searchQuery || undefined,
        type: selectedType || undefined,
    });

    const [deleteMutation, { loading: deleting }] = useDeleteInventoryItem();

    const items = data?.inventoryItems?.data || [];

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleDelete = async () => {
        if (!deleteModalItem) return;
        try {
            await deleteMutation({
                variables: {
                    id: deleteModalItem.id,
                    proyecto_id: proyectoId,
                },
            });
            setDeleteModalItem(null);
        } catch (err) {
            console.error('Error deleting item:', err);
        }
    };

    const handleAdd = () => {
        if (onAdd) onAdd();
        else router.push('/(app)/inventory/new');
    };

    const handleEdit = (item: InventoryItem) => {
        if (onEdit) onEdit(item);
        else router.push(`/(app)/inventory/${item.id}`);
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            raw_material: t('inventory.types.raw_material', 'Materia Prima'),
            finished_good: t('inventory.types.finished_good', 'Prod. Terminado'),
            service: t('inventory.types.service', 'Servicio'),
            asset: t('inventory.types.asset', 'Activo'),
        };
        return labels[type] || type;
    };

    const renderItem = ({ item }: { item: InventoryItem }) => {
        const isLowStock = item.current_stock <= item.min_stock_level;
        
        return (
            <View className={`p-2 ${isTablet ? 'w-1/2' : 'w-full'}`}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleEdit(item)}
                    className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm h-full"
                >
                    <View className="p-4">
                        <View className="flex-row items-start justify-between mb-3">
                            <View className="flex-1 mr-2">
                                <Text className="text-secondary-900 dark:text-secondary-50 font-bold text-base leading-tight" numberOfLines={2}>
                                    {item.name}
                                </Text>
                                {item.sku && (
                                    <Text className="text-secondary-400 dark:text-secondary-500 font-mono text-[9px] mt-1">
                                        {item.sku}
                                    </Text>
                                )}
                            </View>
                            <View className={`px-2 py-0.5 rounded-full ${getTypeBadgeStyle(item.type, isDark)}`}>
                                <Text className="text-[9px] font-bold">
                                    {getTypeLabel(item.type)}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-end justify-between">
                            <View>
                                <Text className="text-[10px] font-bold text-secondary-500 dark:text-secondary-400 mb-1">
                                    {t('inventory.stock', 'Existencias')}
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className={`text-xl font-black ${isLowStock ? 'text-danger-500' : 'text-secondary-900 dark:text-secondary-50'}`}>
                                        {Number(item.current_stock).toLocaleString()}
                                    </Text>
                                    <Text className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 ml-1.5 mb-1">
                                        {item.unit}
                                    </Text>
                                </View>
                            </View>
                            
                            <View className="items-end">
                                {item.sale_price > 0 && (
                                    <>
                                        <Text className="text-[10px] font-bold text-secondary-500 dark:text-secondary-400 mb-1">
                                            {t('inventory.price', 'Precio')}
                                        </Text>
                                        <Text className="text-base font-black text-secondary-900 dark:text-secondary-50">
                                            ${Number(item.sale_price).toFixed(2)}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>

                        {isLowStock && (
                            <View className="flex-row items-center mt-3 bg-danger-50 dark:bg-danger-900/10 px-2.5 py-1.5 rounded-xl self-start border border-danger-100 dark:border-danger-900/20">
                                <ExclamationTriangleIcon size={12} color="#ef4444" />
                                <Text className="text-[10px] font-bold text-danger-500 ml-1.5">
                                    {t('inventory.low_stock', 'Bajo Stock')}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row border-t border-secondary-100 dark:border-secondary-800/50 bg-secondary-50/30 dark:bg-secondary-800/30">
                        <TouchableOpacity 
                            onPress={() => handleEdit(item)} 
                            className="flex-row items-center justify-center flex-1 py-3 active:bg-secondary-100 dark:active:bg-secondary-800"
                        >
                            <PencilIcon size={14} color={theme.primary600} />
                            <Text className="text-xs font-bold ml-2" style={{ color: theme.primary600 }}>
                                {t('common.edit', 'Editar')}
                            </Text>
                        </TouchableOpacity>
                        <View className="w-[1px] bg-secondary-100 dark:border-secondary-800/50" />
                        <TouchableOpacity 
                            onPress={() => setDeleteModalItem(item)} 
                            className="flex-row items-center justify-center flex-1 py-3 active:bg-danger-50 dark:active:bg-danger-900/10"
                        >
                            <TrashIcon size={14} color="#ef4444" />
                            <Text className="text-xs font-bold ml-2 text-danger-500">
                                {t('common.delete', 'Eliminar')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            {/* Header / Search */}
            <View className="px-5 pt-4 pb-6 bg-white dark:bg-secondary-950 border-b border-secondary-100 dark:border-secondary-900">
                <View className="flex-row items-center justify-between mb-6 px-1">
                    <Text className="text-3xl font-black tracking-tighter text-secondary-900 dark:text-secondary-50">
                        {t('inventory.title', 'Inventario')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        className={`w-11 h-11 rounded-2xl items-center justify-center border ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-secondary-900'} ${showFilters ? 'border-primary-200 dark:border-primary-800' : 'border-secondary-200 dark:border-secondary-800'}`}
                    >
                        <FunnelIcon 
                            size={20} 
                            color={showFilters ? theme.primary600 : isDark ? '#9ca3af' : '#6b7280'} 
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center bg-secondary-100/50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl px-4 shadow-sm">
                    <SearchIcon size={20} color={isDark ? '#4b5563' : '#9ca3af'} />
                    <TextInput
                        className="flex-1 py-4 px-3 text-secondary-900 dark:text-secondary-50 font-bold"
                        placeholder={t('inventory.search_placeholder', 'Buscar por nombre o SKU...')}
                        placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => setSearchQuery('')}
                            className="w-8 h-8 rounded-full bg-secondary-200 dark:bg-secondary-800 items-center justify-center"
                        >
                            <XIcon size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    )}
                </View>

                {showFilters && (
                    <View className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-3 ml-1">
                            {t('inventory.filter_by_type', 'Filtrar por tipo')}
                        </Text>
                        <FlashList 
                            data={['', 'raw_material', 'finished_good', 'service', 'asset']}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            // @ts-ignore
                            estimatedItemSize={100}
                            keyExtractor={(item) => item}
                            renderItem={({ item: type }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedType(type)}
                                    className={`mr-3 px-5 py-2.5 rounded-2xl border ${
                                        selectedType === type
                                            ? 'bg-primary-600 border-primary-600'
                                            : 'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800'
                                    }`}
                                >
                                    <Text className={`text-xs font-black uppercase tracking-wider ${
                                        selectedType === type ? 'text-white' : 'text-secondary-600 dark:text-secondary-400'
                                    }`}>
                                        {type === '' 
                                            ? t('inventory.all_types', 'Todos')
                                            : getTypeLabel(type)
                                        }
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>

            <View className="flex-1">
                {loading && !refreshing ? (
                    <View className="p-5">
                        <SkeletonList count={5} />
                    </View>
                ) : filteredItems.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 px-8">
                        <View className="w-24 h-24 rounded-[32px] bg-secondary-100 dark:bg-secondary-900 items-center justify-center mb-6">
                            <PackageIcon size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
                        </View>
                        <Text className="text-xl font-black text-secondary-900 dark:text-secondary-50 mb-2 text-center">
                            {items.length === 0 
                                ? t('inventory.empty', 'Inventario Vacío')
                                : t('inventory.no_items_found', 'Sin resultados')
                            }
                        </Text>
                        <Text className="text-sm font-bold text-secondary-500 dark:text-secondary-400 text-center mb-8 leading-relaxed">
                            {items.length === 0
                                ? t('inventory.empty_description', 'Agrega tu primer item para comenzar a gestionar tu stock de forma profesional.')
                                : t('inventory.try_adjusting_filters', 'Intenta ajustar los filtros o la búsqueda para encontrar lo que necesitas.')
                            }
                        </Text>
                        {items.length === 0 && (
                            <PrimaryButton 
                                onPress={handleAdd}
                                className="px-8 h-14 rounded-2xl"
                            >
                                <PlusIcon size={20} color="white" />
                                <Text className="text-white font-black uppercase tracking-widest ml-3">
                                    {t('inventory.new_item', 'Nuevo Item')}
                                </Text>
                            </PrimaryButton>
                        )}
                    </View>
                ) : (
                    <FlashList
                        data={filteredItems}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        // @ts-ignore
                            estimatedItemSize={180}
                        numColumns={isTablet ? 2 : 1}
                        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={onRefresh}
                                tintColor={theme.primary600}
                                colors={[theme.primary600]}
                            />
                        }
                    />
                )}
            </View>

            {filteredItems.length > 0 && (
                <Pressable
                    onPress={handleAdd}
                    className="absolute bottom-10 right-8 w-16 h-16 rounded-full shadow-2xl items-center justify-center z-50 active:scale-90 transition-all"
                    style={{ 
                        backgroundColor: theme.primary600,
                        shadowColor: theme.primary600,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 10
                    }}
                >
                    <PlusIcon size={32} color="white" />
                </Pressable>
            )}

            <Modal
                visible={!!deleteModalItem}
                onClose={() => setDeleteModalItem(null)}
                size="sm"
            >
                <View className="p-6 bg-white dark:bg-secondary-900 rounded-2xl">
                    <View className="w-14 h-14 rounded-2xl bg-danger-50 dark:bg-danger-900/10 items-center justify-center mb-5 self-center">
                        <TrashIcon size={28} color="#ef4444" />
                    </View>
                    <Text className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-2 tracking-tight text-center">
                        {t('inventory.delete_item', '¿Eliminar item?')}
                    </Text>
                    <Text className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-8 leading-relaxed text-center">
                        {t('inventory.confirm_delete', 'Esta acción no se puede deshacer. El item "{name}" será eliminado permanentemente.').replace('{name}', deleteModalItem?.name || '')}
                    </Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <SecondaryButton 
                                onPress={() => setDeleteModalItem(null)}
                                className="rounded-xl"
                            >
                                <Text className="font-bold">{t('common.cancel', 'No, volver')}</Text>
                            </SecondaryButton>
                        </View>
                        <View className="flex-1">
                            <DangerButton 
                                onPress={handleDelete}
                                loading={deleting}
                                className="rounded-xl"
                            >
                                <Text className="text-white font-bold">{t('common.delete', 'Sí, borrar')}</Text>
                            </DangerButton>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
