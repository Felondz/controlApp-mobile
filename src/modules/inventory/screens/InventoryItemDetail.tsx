import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTranslate } from '../../../shared/hooks/useTranslate';
import { useInventoryItem, useUpdateInventoryItem, InventoryItem } from '../useInventory';
import { useProjectStore } from '../../../stores/projectStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useRouter } from 'expo-router';
import { 
    ArrowLeftIcon,
    PencilIcon,
    XIcon,
    CheckIcon,
    PackageIcon,
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import { SkeletonCard } from '../../../shared/components/Skeleton';

interface InventoryItemDetailProps {
    itemId: string;
    onBack?: () => void;
}

type EditableField = 'name' | 'sku' | 'unit' | 'min_stock_level' | 'sale_price' | 'cost_price';
type ReadOnlyField = 'current_stock';

export default function InventoryItemDetail({ itemId, onBack }: InventoryItemDetailProps) {
    const { t } = useTranslate();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    const { isDark } = useSettingsStore();
    
    const { data, loading, error, refetch } = useInventoryItem(itemId);
    const [updateItem, { loading: updating }] = useUpdateInventoryItem();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState<Partial<InventoryItem>>({});

    useEffect(() => {
        if (data?.inventoryItem) {
            setEditedItem(data.inventoryItem);
        }
    }, [data]);

    const textColor = isDark ? 'text-white' : 'text-secondary-900';
    const textSecondary = isDark ? 'text-secondary-400' : 'text-secondary-500';
    const cardBg = isDark ? 'bg-secondary-800' : 'bg-white';
    const borderColor = isDark ? 'border-secondary-700' : 'border-secondary-200';
    const inputBg = isDark ? 'bg-secondary-700' : 'bg-secondary-50';

    const handleSave = async () => {
        if (!activeProject || !editedItem.id) return;
        
        try {
            await updateItem({
                variables: {
                    id: editedItem.id,
                    proyecto_id: activeProject.id,
                    name: editedItem.name || '',
                    type: editedItem.type || 'finished_good',
                    unit: editedItem.unit || 'units',
                    sku: editedItem.sku,
                    min_stock_level: editedItem.min_stock_level,
                    sale_price: editedItem.sale_price,
                }
            });
            setIsEditing(false);
            refetch();
            Alert.alert('Éxito', 'Item actualizado correctamente');
        } catch (err) {
            console.error('Error updating item:', err);
            Alert.alert('Error', 'No se pudo actualizar el item');
        }
    };

    const handleCancel = () => {
        if (data?.inventoryItem) {
            setEditedItem(data.inventoryItem);
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
                <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b`}>
                    <SkeletonCard />
                </View>
            </View>
        );
    }

    if (error || !data?.inventoryItem) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'} justify-center items-center`}>
                <Text className={textSecondary}>{t('common.error', 'Error al cargar')}</Text>
                <SecondaryButton onPress={() => refetch()} className="mt-4">
                    {t('common.retry', 'Reintentar')}
                </SecondaryButton>
            </View>
        );
    }

    const item = isEditing ? editedItem : data.inventoryItem;

    const renderField = (field: EditableField, label: string, type: 'text' | 'number' = 'text') => (
        <View className={`mb-4`} key={field}>
            <Text className={`text-xs font-medium ${textSecondary} mb-1`}>{label}</Text>
            {isEditing ? (
                <TextInput
                    value={String(item[field as keyof InventoryItem] ?? '')}
                    onChangeText={(text) => setEditedItem(prev => ({
                        ...prev,
                        [field]: type === 'number' ? parseFloat(text) || 0 : text
                    }))}
                    keyboardType={type === 'number' ? 'numeric' : 'default'}
                    className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2 ${textColor}`}
                    placeholderTextColor={textSecondary}
                />
            ) : (
                <Text className={`${textColor}`}>
                    {String(item[field as keyof InventoryItem] ?? '-')}
                </Text>
            )}
        </View>
    );

    return (
        <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
            <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b flex-row items-center justify-between`}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={onBack || (() => router.back())} className="mr-3">
                        <ArrowLeftIcon size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-bold ${textColor}`}>
                        {t('inventory.item_detail', 'Detalle de Item')}
                    </Text>
                </View>
                {!isEditing ? (
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-row items-center">
                        <PencilIcon size={18} color={isDark ? '#818cf8' : '#6366f1'} />
                        <Text className={`ml-1 text-sm font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                            {t('common.edit', 'Editar')}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity onPress={handleCancel}>
                            <XIcon size={24} color="#ef4444" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} disabled={updating}>
                            <CheckIcon size={24} color={updating ? textSecondary : '#22c55e'} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1 p-4">
                <View className={`${cardBg} ${borderColor} border rounded-xl p-4 mb-4`}>
                    <View className="flex-row items-start mb-4">
                        <View className={`w-16 h-16 rounded-xl ${isDark ? 'bg-secondary-700' : 'bg-secondary-100'} items-center justify-center mr-4`}>
                            <PackageIcon size={32} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </View>
                        <View className="flex-1">
                            <Text className={`text-xl font-bold ${textColor}`}>{item.name}</Text>
                            {item.sku && (
                                <Text className={`text-sm font-mono ${textSecondary}`}>{item.sku}</Text>
                            )}
                            <View className={`mt-2 px-2 py-0.5 rounded-full text-xs inline-block ${
                                isDark ? 'bg-secondary-700 text-secondary-300' : 'bg-secondary-100 text-secondary-600'
                            }`}>
                                {item.type}
                            </View>
                        </View>
                    </View>

                    <View className={`h-px ${borderColor} my-4`} />

                        <View className="grid grid-cols-2 gap-4">
                            {renderField('unit', t('inventory.unit', 'Unidad'))}
                            <View className={`mb-4`}>
                                <Text className={`text-xs font-medium ${textSecondary} mb-1`}>{t('inventory.current_stock', 'Stock Actual')}</Text>
                                <Text className={`${(item.current_stock ?? 0) <= (item.min_stock_level ?? 0) ? 'text-danger-500' : textColor} font-bold`}>
                                    {item.current_stock ?? 0}
                                </Text>
                            </View>
                            {renderField('min_stock_level', t('inventory.min_stock', 'Stock Mínimo'), 'number')}
                            {renderField('sale_price', t('inventory.sale_price', 'Precio Venta'), 'number')}
                            {renderField('cost_price', t('inventory.cost_price', 'Precio Costo'), 'number')}
                        </View>
                </View>

                {isEditing && (
                    <PrimaryButton
                        onPress={handleSave}
                        loading={updating}
                        className="mb-4"
                    >
                        {t('common.save', 'Guardar Cambios')}
                    </PrimaryButton>
                )}
            </ScrollView>
        </View>
    );
}
