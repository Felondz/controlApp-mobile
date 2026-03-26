import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslate } from '../../../shared/hooks/useTranslate';
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
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import DangerButton from '../../../shared/components/DangerButton';
import Modal from '../../../shared/components/Modal';
import { SkeletonList } from '../../../shared/components/Skeleton';
import { useSettingsStore } from '../../../stores/settingsStore';

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
    const { isDark } = useSettingsStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModalItem, setDeleteModalItem] = useState<InventoryItem | null>(null);
    const [refreshing, setRefreshing] = useState(false);

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

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            raw_material: t('inventory.types.raw_material', 'Materia Prima'),
            finished_good: t('inventory.types.finished_good', 'Prod. Terminado'),
            service: t('inventory.types.service', 'Servicio'),
            asset: t('inventory.types.asset', 'Activo'),
        };
        return labels[type] || type;
    };

    const bgColor = isDark ? 'bg-secondary-900' : 'bg-secondary-50';
    const cardBg = isDark ? 'bg-secondary-800' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-secondary-900';
    const textSecondary = isDark ? 'text-secondary-400' : 'text-secondary-500';
    const borderColor = isDark ? 'border-secondary-700' : 'border-secondary-200';
    const inputBg = isDark ? 'bg-secondary-700' : 'bg-white';

    const renderItem = ({ item }: { item: InventoryItem }) => {
        const isLowStock = item.current_stock <= item.min_stock_level;
        
        return (
            <TouchableOpacity
                onPress={() => onEdit?.(item)}
                className={`${cardBg} ${borderColor} border rounded-xl mb-3 overflow-hidden`}
            >
                <View className="flex-row p-4">
                    <View className={`w-12 h-12 rounded-lg ${isDark ? 'bg-secondary-700' : 'bg-secondary-100'} items-center justify-center mr-4`}>
                        <PackageIcon size={24} color={isDark ? '#6b7280' : '#9ca3af'} />
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1">
                                <Text className={`text-sm font-semibold ${textColor}`}>
                                    {item.name}
                                </Text>
                                {item.sku && (
                                    <Text className={`text-xs font-mono ${textSecondary} mt-0.5`}>
                                        {item.sku}
                                    </Text>
                                )}
                            </View>
                            <View className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeBadgeStyle(item.type, isDark)}`}>
                                {getTypeLabel(item.type)}
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between mt-2">
                            <View className="flex-row items-center">
                                <Text className={`text-base font-bold ${isLowStock ? 'text-danger-500' : textColor}`}>
                                    {Number(item.current_stock).toLocaleString()}
                                </Text>
                                <Text className={`text-xs ${textSecondary} ml-1`}>
                                    {item.unit}
                                </Text>
                            </View>
                            {item.sale_price > 0 && (
                                <Text className={`text-sm ${textSecondary}`}>
                                    ${Number(item.sale_price).toFixed(2)}
                                </Text>
                            )}
                        </View>

                        {isLowStock && (
                            <View className="flex-row items-center mt-2">
                                <ExclamationTriangleIcon size={12} color="#ef4444" />
                                <Text className="text-xs text-danger-500 ml-1">
                                    {t('inventory.low_stock', 'Bajo Stock')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className={`flex-row border-t ${borderColor} px-4 py-2`}>
                    <TouchableOpacity onPress={() => onEdit?.(item)} className="flex-row items-center mr-4">
                        <PencilIcon size={14} color={isDark ? '#818cf8' : '#6366f1'} />
                        <Text className={`text-xs ml-1 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                            {t('common.edit', 'Editar')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDeleteModalItem(item)} className="flex-row items-center">
                        <TrashIcon size={14} color="#ef4444" />
                        <Text className="text-xs ml-1 text-danger-500">
                            {t('common.delete', 'Eliminar')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b`}>
                <View className="flex-row items-center justify-between mb-3">
                    <Text className={`text-lg font-bold ${textColor}`}>
                        {t('inventory.title', 'Inventario')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg ${showFilters ? (isDark ? 'bg-primary-900/20' : 'bg-primary-100') : ''}`}
                    >
                        <FunnelIcon 
                            size={20} 
                            color={showFilters ? 'rgb(var(--color-primary-500))' : isDark ? '#6b7280' : '#9ca3af'} 
                        />
                    </TouchableOpacity>
                </View>

                <View className={`flex-row items-center ${inputBg} ${borderColor} border rounded-lg px-3`}>
                    <SearchIcon size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
                    <TextInput
                        className={`flex-1 py-2.5 px-2 ${textColor}`}
                        placeholder={t('inventory.search_placeholder', 'Buscar por nombre o SKU...')}
                        placeholderTextColor={textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <XIcon size={18} color={textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {showFilters && (
                    <View className={`mt-3 p-3 ${isDark ? 'bg-secondary-700/50' : 'bg-secondary-50'} rounded-lg`}>
                        <Text className={`text-xs font-medium mb-2 ${textSecondary}`}>
                            {t('inventory.type_label', 'Tipo')}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-2">
                                {['', 'raw_material', 'finished_good', 'service', 'asset'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setSelectedType(type)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                            selectedType === type
                                                ? 'bg-primary-500 text-white'
                                                : isDark 
                                                    ? 'bg-secondary-700 text-secondary-300' 
                                                    : 'bg-white text-secondary-700 border border-secondary-200'
                                        }`}
                                    >
                                        {type === '' 
                                            ? t('inventory.all_types', 'Todos')
                                            : getTypeLabel(type)
                                        }
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}
            </View>

            <View className="flex-1">
                {loading ? (
                    <View className="p-4">
                        <SkeletonList count={5} />
                    </View>
                ) : filteredItems.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 px-4">
                        <View className={`w-16 h-16 rounded-full ${isDark ? 'bg-secondary-700' : 'bg-secondary-100'} items-center justify-center mb-4`}>
                            <PackageIcon size={32} color={isDark ? '#6b7280' : '#9ca3af'} />
                        </View>
                        <Text className={`text-lg font-medium ${textColor} mb-1`}>
                            {items.length === 0 
                                ? t('inventory.empty', 'No hay items en el inventario')
                                : t('inventory.no_items_found', 'No se encontraron items')
                            }
                        </Text>
                        <Text className={`text-sm ${textSecondary} mb-4 text-center`}>
                            {items.length === 0
                                ? t('inventory.empty_description', 'Agrega tu primer item para comenzar')
                                : t('inventory.try_adjusting_filters', 'Intenta ajustar los filtros de búsqueda')
                            }
                        </Text>
                        {onAdd && items.length === 0 && (
                            <PrimaryButton onPress={onAdd}>
                                <PlusIcon size={16} color="rgb(var(--color-primary-700))" />
                                <Text className="text-primary-700 ml-2">{t('inventory.new_item', 'Nuevo Item')}</Text>
                            </PrimaryButton>
                        )}
                    </View>
                ) : (
                    <ScrollView
                        className="flex-1 p-4"
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        {filteredItems.map((item) => (
                            <View key={item.id}>
                                {renderItem({ item })}
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {onAdd && filteredItems.length > 0 && (
                <View className="absolute bottom-6 right-6">
                    <TouchableOpacity
                        onPress={onAdd}
                        className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
                        style={{ backgroundColor: 'rgb(var(--color-primary-500))' }}
                    >
                        <PlusIcon size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={!!deleteModalItem}
                onClose={() => setDeleteModalItem(null)}
                size="sm"
            >
                <View className={`p-6 ${cardBg} rounded-xl`}>
                    <Text className={`text-lg font-bold ${textColor} mb-2`}>
                        {t('common.delete', 'Eliminar')} Item
                    </Text>
                    <Text className={`${textSecondary} mb-6`}>
                        {t('inventory.confirm_delete', '¿Estás seguro de que quieres eliminar este item?')}
                    </Text>
                    <View className="flex-row justify-end gap-3">
                        <SecondaryButton onPress={() => setDeleteModalItem(null)}>
                            {t('common.cancel', 'Cancelar')}
                        </SecondaryButton>
                        <DangerButton 
                            onPress={handleDelete}
                            loading={deleting}
                        >
                            {t('common.delete', 'Eliminar')}
                        </DangerButton>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
