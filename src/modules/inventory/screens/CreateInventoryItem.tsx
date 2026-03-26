import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslate } from '../../../shared/hooks/useTranslate';
import { useCreateInventoryItem } from '../useInventory';
import { useProjectStore } from '../../../stores/projectStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { 
    ArrowLeftIcon,
    XIcon,
    PackageIcon,
} from '../../../shared/icons';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import SecondaryButton from '../../../shared/components/SecondaryButton';

interface CreateInventoryItemProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const ITEM_TYPES = [
    { value: 'raw_material', label: 'Materia Prima' },
    { value: 'finished_good', label: 'Producto Terminado' },
    { value: 'component', label: 'Componente' },
    { value: 'service', label: 'Servicio' },
    { value: 'asset', label: 'Activo' },
];

export default function CreateInventoryItem({ onSuccess, onCancel }: CreateInventoryItemProps) {
    const { t } = useTranslate();
    const router = useRouter();
    const { activeProject } = useProjectStore();
    const { isDark } = useSettingsStore();
    
    const [createItem, { loading }] = useCreateInventoryItem();
    
    const [form, setForm] = useState({
        name: '',
        sku: '',
        type: 'finished_good',
        unit: '',
        min_stock_level: '0',
        initial_quantity: '0',
        initial_cost: '0',
        sale_price: '0',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});

    const textColor = isDark ? 'text-white' : 'text-secondary-900';
    const textSecondary = isDark ? 'text-secondary-400' : 'text-secondary-500';
    const cardBg = isDark ? 'bg-secondary-800' : 'bg-white';
    const borderColor = isDark ? 'border-secondary-700' : 'border-secondary-200';
    const inputBg = isDark ? 'bg-secondary-700' : 'bg-secondary-50';

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }
        if (!form.unit.trim()) {
            newErrors.unit = 'La unidad es requerida';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!activeProject) {
            Alert.alert('Error', 'No hay proyecto activo');
            return;
        }
        
        if (!validate()) return;
        
        try {
            await createItem({
                variables: {
                    proyecto_id: activeProject.id,
                    name: form.name.trim(),
                    type: form.type,
                    unit: form.unit.trim(),
                    sku: form.sku.trim() || undefined,
                    min_stock_level: parseFloat(form.min_stock_level) || 0,
                    initial_quantity: parseFloat(form.initial_quantity) || 0,
                    initial_cost: parseFloat(form.initial_cost) || 0,
                    sale_price: parseFloat(form.sale_price) || 0,
                }
            });
            Alert.alert('Éxito', 'Item creado correctamente');
            onSuccess?.();
            router.back();
        } catch (err) {
            console.error('Error creating item:', err);
            Alert.alert('Error', 'No se pudo crear el item');
        }
    };

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>
            <View className={`px-4 py-3 ${cardBg} ${borderColor} border-b flex-row items-center justify-between`}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={onCancel || (() => router.back())} className="mr-3">
                        <ArrowLeftIcon size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-bold ${textColor}`}>
                        {t('inventory.new_item', 'Nuevo Item')}
                    </Text>
                </View>
                <TouchableOpacity onPress={onCancel || (() => router.back())}>
                    <XIcon size={24} color={textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className={`${cardBg} ${borderColor} border rounded-xl p-4 mb-4`}>
                    <View className="flex-row items-center mb-4">
                        <View className={`w-12 h-12 rounded-xl ${isDark ? 'bg-secondary-700' : 'bg-secondary-100'} items-center justify-center mr-3`}>
                            <PackageIcon size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </View>
                        <Text className={`text-sm ${textSecondary}`}>
                            {t('inventory.item_info', 'Información del Item')}
                        </Text>
                    </View>

                    <View className="mb-4">
                        <Text className={`text-xs font-medium ${textSecondary} mb-1`}>
                            {t('inventory.name', 'Nombre')} *
                        </Text>
                        <TextInput
                            value={form.name}
                            onChangeText={(text) => updateField('name', text)}
                            placeholder="Ej: Tornillo M5"
                            placeholderTextColor={textSecondary}
                            className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2.5 ${textColor} ${errors.name ? 'border-danger-500' : ''}`}
                        />
                        {errors.name && (
                            <Text className="text-xs text-danger-500 mt-1">{errors.name}</Text>
                        )}
                    </View>

                    <View className="mb-4">
                        <Text className={`text-xs font-medium ${textSecondary} mb-1`}>
                            {t('inventory.sku', 'SKU / Código')}
                        </Text>
                        <TextInput
                            value={form.sku}
                            onChangeText={(text) => updateField('sku', text)}
                            placeholder="Ej: TORN-M5-001"
                            placeholderTextColor={textSecondary}
                            className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2.5 ${textColor}`}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className={`text-xs font-medium ${textSecondary} mb-2`}>
                            {t('inventory.type', 'Tipo')} *
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-2">
                                {ITEM_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        onPress={() => updateField('type', type.value)}
                                        className={`px-4 py-2 rounded-lg border ${
                                            form.type === type.value
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : `${borderColor} ${isDark ? 'bg-secondary-700' : 'bg-secondary-50'}`
                                        }`}
                                    >
                                        <Text className={`text-sm ${
                                            form.type === type.value
                                                ? 'text-primary-600 dark:text-primary-400 font-medium'
                                                : textSecondary
                                        }`}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    <View className="mb-4">
                        <Text className={`text-xs font-medium ${textSecondary} mb-1`}>
                            {t('inventory.unit', 'Unidad')} *
                        </Text>
                        <TextInput
                            value={form.unit}
                            onChangeText={(text) => updateField('unit', text)}
                            placeholder="Ej: unidades, kg, metros"
                            placeholderTextColor={textSecondary}
                            className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2.5 ${textColor} ${errors.unit ? 'border-danger-500' : ''}`}
                        />
                        {errors.unit && (
                            <Text className="text-xs text-danger-500 mt-1">{errors.unit}</Text>
                        )}
                    </View>
                </View>

                <View className={`${cardBg} ${borderColor} border rounded-xl p-4 mb-4`}>
                    <Text className={`text-sm font-medium ${textSecondary} mb-3`}>
                        {t('inventory.stock_pricing', 'Stock y Precios')}
                    </Text>

                    <View className="grid grid-cols-2 gap-4">
                        <View className="mb-3">
                            <Text className={`text-xs font-medium ${textSecondary} mb-1`}>
                                {t('inventory.initial_stock', 'Stock Inicial')}
                            </Text>
                            <TextInput
                                value={form.initial_quantity}
                                onChangeText={(text) => updateField('initial_quantity', text)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={textSecondary}
                                className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2 ${textColor}`}
                            />
                        </View>

                        <View className="mb-3">
                            <Text className={`text-xs font-medium ${textSecondary} mb-1`}>
                                {t('inventory.min_stock', 'Stock Mínimo')}
                            </Text>
                            <TextInput
                                value={form.min_stock_level}
                                onChangeText={(text) => updateField('min_stock_level', text)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={textSecondary}
                                className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2 ${textColor}`}
                            />
                        </View>

                        <View className="mb-3">
                            <Text className={`text-xs font-medium ${textSecondary} mb-1`}>
                                {t('inventory.cost_price', 'Precio Costo')}
                            </Text>
                            <TextInput
                                value={form.initial_cost}
                                onChangeText={(text) => updateField('initial_cost', text)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={textSecondary}
                                className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2 ${textColor}`}
                            />
                        </View>

                        <View className="mb-3">
                            <Text className={`text-xs font-medium ${textSecondary} mb-1`}>
                                {t('inventory.sale_price', 'Precio Venta')}
                            </Text>
                            <TextInput
                                value={form.sale_price}
                                onChangeText={(text) => updateField('sale_price', text)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={textSecondary}
                                className={`${inputBg} ${borderColor} border rounded-lg px-3 py-2 ${textColor}`}
                            />
                        </View>
                    </View>
                </View>

                <View className="gap-3 mb-8">
                    <PrimaryButton
                        onPress={handleSubmit}
                        loading={loading}
                        fullWidth
                    >
                        {t('common.save', 'Guardar')}
                    </PrimaryButton>
                    
                    <SecondaryButton
                        onPress={onCancel || (() => router.back())}
                        fullWidth
                    >
                        {t('common.cancel', 'Cancelar')}
                    </SecondaryButton>
                </View>
            </ScrollView>
        </View>
    );
}
