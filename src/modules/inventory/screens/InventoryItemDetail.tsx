import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Pressable, useWindowDimensions } from 'react-native';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useInventoryItem, useUpdateInventoryItem, InventoryItem } from '../useInventory';
import { useProjectStore } from '../../../stores/projectStore';
import { useRouter } from 'expo-router';
import { 
    ArrowLeftIcon,
    PencilIcon,
    XIcon,
    CheckIcon,
    PackageIcon,
    TagIcon,
    CubeIcon
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';
import { SkeletonCard } from '../../../shared/components/Skeleton';

interface InventoryItemDetailProps {
    itemId: string;
    onBack?: () => void;
}

type EditableField = 'name' | 'sku' | 'unit' | 'min_stock_level' | 'sale_price' | 'cost_price';

export default function InventoryItemDetail({ itemId, onBack }: InventoryItemDetailProps) {
    const { t } = useTranslate();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    
    const { data, loading, error, refetch } = useInventoryItem(itemId);
    const [updateItem, { loading: updating }] = useUpdateInventoryItem();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState<Partial<InventoryItem>>({});

    const isTablet = width >= 768;

    useEffect(() => {
        if (data?.inventoryItem) {
            setEditedItem(data.inventoryItem);
        }
    }, [data]);

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
        } catch (err) {
            console.error('Error updating item:', err);
            Alert.alert('Error', t('inventory.errors.update_failed', 'No se pudo actualizar el item'));
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
            <View className="flex-1 bg-secondary-50 dark:bg-secondary-950 p-5">
                <SkeletonCard />
                <View className="h-4" />
                <SkeletonCard />
            </View>
        );
    }

    if (error || !data?.inventoryItem) {
        return (
            <View className="flex-1 bg-secondary-50 dark:bg-secondary-950 justify-center items-center p-8">
                <View className="w-20 h-20 rounded-3xl bg-secondary-100 dark:bg-secondary-900 items-center justify-center mb-6">
                    <XIcon size={40} color="#ef4444" />
                </View>
                <Text className="text-xl font-black text-secondary-900 dark:text-secondary-50 mb-2">{t('common.error', 'Error al cargar')}</Text>
                <Text className="text-secondary-500 text-center mb-8">{t('inventory.errors.load_failed', 'No pudimos obtener los detalles del item.')}</Text>
                <SecondaryButton onPress={() => refetch()} className="px-8 h-14 rounded-2xl">
                    {t('common.retry', 'Reintentar')}
                </SecondaryButton>
            </View>
        );
    }

    const item = isEditing ? editedItem : data.inventoryItem;

    const renderInput = (field: EditableField, label: string, type: 'text' | 'number' = 'text', prefix?: string) => (
        <View className="mb-5" key={field}>
            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-[2px] mb-2 ml-1">
                {label}
            </Text>
            <View className="relative justify-center">
                {prefix && <Text className="absolute left-5 z-10 font-bold text-secondary-400">{prefix}</Text>}
                <TextInput
                    value={String(item[field as keyof InventoryItem] ?? '')}
                    onChangeText={(text) => setEditedItem(prev => ({
                        ...prev,
                        [field]: type === 'number' ? parseFloat(text) || 0 : text
                    }))}
                    keyboardType={type === 'number' ? 'numeric' : 'default'}
                    className={`bg-secondary-50 dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-800 rounded-2xl ${prefix ? 'pl-9' : 'px-5'} py-4 text-secondary-900 dark:text-secondary-50 font-bold`}
                    placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                />
            </View>
        </View>
    );

    const renderDataPoint = (label: string, value: string | number, icon: React.ReactNode, isCritical?: boolean) => (
        <View className="mb-6 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-800 items-center justify-center mr-4">
                {icon}
            </View>
            <View>
                <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-0.5">
                    {label}
                </Text>
                <Text className={`text-base font-black ${isCritical ? 'text-danger-500' : 'text-secondary-900 dark:text-secondary-50'}`}>
                    {value}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            {/* Header */}
            <View className="px-5 pt-4 pb-6 bg-white dark:bg-secondary-950 border-b border-secondary-100 dark:border-secondary-900">
                <View className="flex-row items-center justify-between px-1">
                    <View className="flex-row items-center flex-1">
                        <Pressable 
                            onPress={onBack || (() => router.back())}
                            className="w-11 h-11 rounded-2xl items-center justify-center border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 mr-4 active:scale-95"
                        >
                            <ArrowLeftIcon size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </Pressable>
                        <View className="flex-1">
                            <Text className="text-2xl font-black tracking-tighter text-secondary-900 dark:text-secondary-50 leading-tight" numberOfLines={1}>
                                {isEditing ? t('common.edit', 'Editar') : item.name}
                            </Text>
                            {!isEditing && (
                                <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                                    {item.sku || t('inventory.no_sku', 'Sin SKU')}
                                </Text>
                            )}
                        </View>
                    </View>
                    
                    {!isEditing ? (
                        <Pressable 
                            onPress={() => setIsEditing(true)}
                            className="w-11 h-11 rounded-2xl items-center justify-center bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 active:scale-95"
                        >
                            <PencilIcon size={20} color={theme.primary600} />
                        </Pressable>
                    ) : (
                        <View className="flex-row items-center gap-2">
                            <Pressable 
                                onPress={handleCancel}
                                className="w-11 h-11 rounded-2xl items-center justify-center bg-secondary-100 dark:bg-secondary-800 active:scale-95"
                            >
                                <XIcon size={22} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </Pressable>
                            <Pressable 
                                onPress={handleSave}
                                disabled={updating}
                                className="w-11 h-11 rounded-2xl items-center justify-center active:scale-95"
                                style={{ backgroundColor: theme.primary600 }}
                            >
                                <CheckIcon size={22} color="white" />
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Identity Card */}
                {!isEditing && (
                    <View className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-[32px] p-6 shadow-sm mb-6">
                        <View className="flex-row items-center mb-8">
                            <View className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-900/20 items-center justify-center mr-6">
                                <PackageIcon size={40} color={theme.primary600} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-2xl font-black text-secondary-900 dark:text-secondary-50 leading-tight">
                                    {item.name}
                                </Text>
                                <View className="flex-row mt-3">
                                    <View className="bg-secondary-100 dark:bg-secondary-800 px-3 py-1 rounded-full border border-secondary-200 dark:border-secondary-700">
                                        <Text className="text-[10px] font-black text-secondary-600 dark:text-secondary-400 uppercase tracking-widest">
                                            {item.type}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row flex-wrap" style={{ marginHorizontal: -12 }}>
                            <View className="px-3 w-1/2">
                                {renderDataPoint(
                                    t('inventory.stock', 'Existencias'), 
                                    `${Number(item.current_stock).toLocaleString()} ${item.unit}`, 
                                    <CubeIcon size={18} color={theme.primary600} />,
                                    (item.current_stock ?? 0) <= (item.min_stock_level ?? 0)
                                )}
                            </View>
                            <View className="px-3 w-1/2">
                                {renderDataPoint(
                                    t('inventory.min_stock', 'Seguridad'), 
                                    Number(item.min_stock_level).toLocaleString(), 
                                    <TagIcon size={18} color="#f59e0b" />
                                )}
                            </View>
                            <View className="px-3 w-1/2">
                                {renderDataPoint(
                                    t('inventory.sale_price', 'Venta'), 
                                    `$${Number(item.sale_price).toFixed(2)}`, 
                                    <Text className="font-bold text-primary-600">$</Text>
                                )}
                            </View>
                            <View className="px-3 w-1/2">
                                {renderDataPoint(
                                    t('inventory.cost_price', 'Costo'), 
                                    `$${Number(item.cost_price).toFixed(2)}`, 
                                    <Text className="font-bold text-secondary-500">$</Text>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* Edit Form */}
                {isEditing && (
                    <View className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-[32px] p-6 shadow-sm mb-6">
                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 items-center justify-center mr-4">
                                <PencilIcon size={24} color={theme.primary600} />
                            </View>
                            <View>
                                <Text className="text-lg font-black text-secondary-900 dark:text-secondary-50 leading-tight">
                                    {t('inventory.edit_item', 'Editar Información')}
                                </Text>
                                <Text className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">
                                    {t('inventory.modify_fields', 'Modificar Atributos')}
                                </Text>
                            </View>
                        </View>

                        <View className="space-y-1">
                            {renderInput('name', t('inventory.name', 'Nombre del Item'))}
                            {renderInput('sku', t('inventory.sku', 'Código SKU'))}
                            
                            <View className="flex-row" style={{ marginHorizontal: -8 }}>
                                <View className="px-2 flex-1">
                                    {renderInput('unit', t('inventory.unit', 'Unidad'))}
                                </View>
                                <View className="px-2 flex-1">
                                    {renderInput('min_stock_level', t('inventory.min_stock', 'Mínimo'), 'number')}
                                </View>
                            </View>

                            <View className="flex-row" style={{ marginHorizontal: -8 }}>
                                <View className="px-2 flex-1">
                                    {renderInput('sale_price', t('inventory.sale_price', 'P. Venta'), 'number', '$')}
                                </View>
                                <View className="px-2 flex-1">
                                    {renderInput('cost_price', t('inventory.cost_price', 'P. Costo'), 'number', '$')}
                                </View>
                            </View>
                        </View>

                        <PrimaryButton
                            onPress={handleSave}
                            loading={updating}
                            className="mt-4 h-16 rounded-2xl"
                        >
                            <Text className="text-white font-black uppercase tracking-widest">
                                {t('common.save_changes', 'Guardar Cambios')}
                            </Text>
                        </PrimaryButton>
                    </View>
                )}

                {!isEditing && (
                    <View className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-[32px] p-8 shadow-sm items-center">
                        <Text className="text-secondary-400 dark:text-secondary-500 text-xs font-black uppercase tracking-[3px] mb-2">
                            {t('inventory.last_update', 'Última Actualización')}
                        </Text>
                        <Text className="text-secondary-900 dark:text-secondary-50 font-bold">
                            {new Date(item.updated_at || new Date()).toLocaleString()}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
