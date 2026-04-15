import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslate, useAppTheme } from '../../../shared/hooks';
import { useCreateInventoryItem } from '../useInventory';
import { useProjectStore } from '../../../stores/projectStore';
import { 
    ArrowLeftIcon,
    XIcon,
    PackageIcon,
    CheckIcon
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
    const { theme, isDark } = useAppTheme();
    const { width } = useWindowDimensions();
    
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

    const isTablet = width >= 768;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) {
            newErrors.name = t('inventory.errors.name_required', 'El nombre es requerido');
        }
        if (!form.unit.trim()) {
            newErrors.unit = t('inventory.errors.unit_required', 'La unidad es requerida');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!activeProject) {
            Alert.alert('Error', t('common.no_active_project', 'No hay proyecto activo'));
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
            onSuccess?.();
            router.back();
        } catch (err) {
            console.error('Error creating item:', err);
            Alert.alert('Error', t('inventory.errors.create_failed', 'No se pudo crear el item'));
        }
    };

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <View className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            {/* Header */}
            <View className="px-5 pt-4 pb-6 bg-white dark:bg-secondary-950 border-b border-secondary-100 dark:border-secondary-900">
                <View className="flex-row items-center justify-between px-1">
                    <View className="flex-row items-center">
                        <Pressable 
                            onPress={onCancel || (() => router.back())}
                            className="w-11 h-11 rounded-2xl items-center justify-center border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 mr-4 active:scale-95"
                        >
                            <ArrowLeftIcon size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </Pressable>
                        <View>
                            <Text className="text-2xl font-black tracking-tighter text-secondary-900 dark:text-secondary-50">
                                {t('inventory.new_item', 'Nuevo Item')}
                            </Text>
                            <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                                {t('inventory.registration', 'Registro de Existencias')}
                            </Text>
                        </View>
                    </View>
                    <Pressable 
                        onPress={handleSubmit}
                        disabled={loading}
                        className={`w-11 h-11 rounded-2xl items-center justify-center ${loading ? 'bg-secondary-100 dark:bg-secondary-800' : ''}`}
                        style={!loading ? { backgroundColor: theme.primary600 } : {}}
                    >
                        <CheckIcon size={24} color={loading ? (isDark ? '#4b5563' : '#9ca3af') : 'white'} />
                    </Pressable>
                </View>
            </View>

            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-[32px] p-6 shadow-sm mb-6">
                    <View className="flex-row items-center mb-6">
                        <View className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 items-center justify-center mr-4">
                            <PackageIcon size={24} color={theme.primary600} />
                        </View>
                        <View>
                            <Text className="text-lg font-black text-secondary-900 dark:text-secondary-50 leading-tight">
                                {t('inventory.general_info', 'Información General')}
                            </Text>
                            <Text className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">
                                {t('inventory.basic_data', 'Datos Básicos')}
                            </Text>
                        </View>
                    </View>

                    <View className="space-y-5">
                        <View>
                            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-[2px] mb-2 ml-1">
                                {t('inventory.name', 'Nombre del Item')} *
                            </Text>
                            <TextInput
                                value={form.name}
                                onChangeText={(text) => updateField('name', text)}
                                placeholder={t('inventory.name_placeholder', 'Ej: Tornillo M5 de Acero')}
                                placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                className={`bg-secondary-50 dark:bg-secondary-950 border ${errors.name ? 'border-danger-500' : 'border-secondary-100 dark:border-secondary-800'} rounded-2xl px-5 py-4 text-secondary-900 dark:text-secondary-50 font-bold`}
                            />
                            {errors.name && (
                                <Text className="text-xs font-black text-danger-500 mt-2 ml-1 uppercase tracking-wider">{errors.name}</Text>
                            )}
                        </View>

                        <View>
                            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-[2px] mb-2 ml-1">
                                {t('inventory.sku', 'Código SKU / Identificador')}
                            </Text>
                            <TextInput
                                value={form.sku}
                                onChangeText={(text) => updateField('sku', text)}
                                placeholder="Ej: TORN-M5-001"
                                placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                className="bg-secondary-50 dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-800 rounded-2xl px-5 py-4 text-secondary-900 dark:text-secondary-50 font-mono text-sm"
                            />
                        </View>

                        <View>
                            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-[2px] mb-3 ml-1">
                                {t('inventory.type', 'Tipo de Recurso')} *
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-3">
                                    {ITEM_TYPES.map((type) => (
                                        <Pressable
                                            key={type.value}
                                            onPress={() => updateField('type', type.value)}
                                            className={`px-5 py-3 rounded-2xl border ${
                                                form.type === type.value
                                                    ? 'bg-primary-600 border-primary-600'
                                                    : 'bg-secondary-50 dark:bg-secondary-950 border-secondary-100 dark:border-secondary-800'
                                            }`}
                                        >
                                            <Text className={`text-xs font-black uppercase tracking-wider ${
                                                form.type === type.value ? 'text-white' : 'text-secondary-600 dark:text-secondary-400'
                                            }`}>
                                                {type.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        <View>
                            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-[2px] mb-2 ml-1">
                                {t('inventory.unit', 'Unidad de Medida')} *
                            </Text>
                            <TextInput
                                value={form.unit}
                                onChangeText={(text) => updateField('unit', text)}
                                placeholder={t('inventory.unit_placeholder', 'Ej: unidades, kg, metros')}
                                placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                className={`bg-secondary-50 dark:bg-secondary-950 border ${errors.unit ? 'border-danger-500' : 'border-secondary-100 dark:border-secondary-800'} rounded-2xl px-5 py-4 text-secondary-900 dark:text-secondary-50 font-bold`}
                            />
                            {errors.unit && (
                                <Text className="text-xs font-black text-danger-500 mt-2 ml-1 uppercase tracking-wider">{errors.unit}</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-[32px] p-6 shadow-sm mb-8">
                    <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-[2px] mb-6 ml-1">
                        {t('inventory.stock_pricing', 'Control de Stock y Costos')}
                    </Text>

                    <View className="flex-row flex-wrap" style={{ marginHorizontal: -8 }}>
                        <View className="px-2 mb-5" style={{ width: isTablet ? '50%' : '50%' }}>
                            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2 ml-1">
                                {t('inventory.initial_stock', 'Existencia Inicial')}
                            </Text>
                            <TextInput
                                value={form.initial_quantity}
                                onChangeText={(text) => updateField('initial_quantity', text)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                className="bg-secondary-50 dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-800 rounded-2xl px-5 py-4 text-secondary-900 dark:text-secondary-50 font-bold"
                            />
                        </View>

                        <View className="px-2 mb-5" style={{ width: isTablet ? '50%' : '50%' }}>
                            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2 ml-1">
                                {t('inventory.min_stock', 'Stock de Seguridad')}
                            </Text>
                            <TextInput
                                value={form.min_stock_level}
                                onChangeText={(text) => updateField('min_stock_level', text)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                className="bg-secondary-50 dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-800 rounded-2xl px-5 py-4 text-secondary-900 dark:text-secondary-50 font-bold"
                            />
                        </View>

                        <View className="px-2 mb-5" style={{ width: isTablet ? '50%' : '50%' }}>
                            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2 ml-1">
                                {t('inventory.cost_price', 'Costo Unitario')}
                            </Text>
                            <View className="relative justify-center">
                                <Text className="absolute left-5 z-10 font-bold text-secondary-400">$</Text>
                                <TextInput
                                    value={form.initial_cost}
                                    onChangeText={(text) => updateField('initial_cost', text)}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                    className="bg-secondary-50 dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-800 rounded-2xl pl-9 pr-5 py-4 text-secondary-900 dark:text-secondary-50 font-bold"
                                />
                            </View>
                        </View>

                        <View className="px-2 mb-5" style={{ width: isTablet ? '50%' : '50%' }}>
                            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2 ml-1">
                                {t('inventory.sale_price', 'Precio de Venta')}
                            </Text>
                            <View className="relative justify-center">
                                <Text className="absolute left-5 z-10 font-bold text-secondary-400">$</Text>
                                <TextInput
                                    value={form.sale_price}
                                    onChangeText={(text) => updateField('sale_price', text)}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                    className="bg-secondary-50 dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-800 rounded-2xl pl-9 pr-5 py-4 text-secondary-900 dark:text-secondary-50 font-bold"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="gap-4">
                    <PrimaryButton
                        onPress={handleSubmit}
                        loading={loading}
                        className="h-16 rounded-2xl shadow-xl shadow-primary-600/20"
                    >
                        <Text className="text-white font-black uppercase tracking-[2px]">{t('common.save', 'Guardar Item')}</Text>
                    </PrimaryButton>
                    
                    <SecondaryButton
                        onPress={onCancel || (() => router.back())}
                        className="h-16 rounded-2xl"
                    >
                        <Text className="font-black uppercase tracking-[2px]">{t('common.cancel', 'Cancelar')}</Text>
                    </SecondaryButton>
                </View>
            </ScrollView>
        </View>
    );
}
