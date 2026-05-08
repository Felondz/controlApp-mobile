import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslate, useAppTheme } from '../../hooks';
import Modal from '../Modal';
import InputLabel from '../InputLabel';
import { ChevronDownIcon } from '../../icons';

interface Option {
    label: string;
    value: string | number;
}

interface SelectProps {
    label?: string;
    value: string | number;
    options: Option[];
    onValueChange: (value: any) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    icon?: any;
}

export const Select = ({
    label,
    value,
    options,
    onValueChange,
    placeholder,
    error,
    required,
    icon: Icon,
}: SelectProps) => {
    const { t } = useTranslate();
    const { theme, isDark } = useAppTheme();
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val: any) => {
        onValueChange(val);
        setModalVisible(false);
    };

    return (
        <View className="w-full">
            {label && <InputLabel required={required}>{label}</InputLabel>}
            
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
                className={`w-full h-14 px-4 rounded-2xl border-2 flex-row items-center justify-between ${
                    error 
                        ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/10' 
                        : 'border-secondary-100 dark:border-secondary-800 bg-white dark:bg-secondary-900'
                }`}
            >
                <View className="flex-row items-center flex-1">
                    {Icon && (
                        <View className="mr-3">
                            <Icon size={20} color={error ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b')} />
                        </View>
                    )}
                    <Text className={`text-base flex-1 ${selectedOption ? 'text-secondary-900 dark:text-white' : 'text-secondary-400 dark:text-secondary-500'}`}>
                        {selectedOption ? selectedOption.label : (placeholder || t('common.select_option', 'Seleccionar...'))}
                    </Text>
                </View>
                <ChevronDownIcon size={20} color={isDark ? '#4b5563' : '#9ca3af'} />
            </TouchableOpacity>

            {error && (
                <Text className="text-danger-500 text-xs mt-1 ml-1 font-medium">
                    {error}
                </Text>
            )}

            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={label || t('common.select_option')}
                size="md"
            >
                <ScrollView 
                    className="max-h-[400px]" 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, gap: 8 }}
                >
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => handleSelect(option.value)}
                            className={`p-4 rounded-xl flex-row items-center justify-between ${
                                value === option.value 
                                    ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500' 
                                    : 'bg-secondary-50 dark:bg-secondary-800/50 border-2 border-transparent'
                            }`}
                        >
                            <Text className={`font-bold text-base ${value === option.value ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-700 dark:text-secondary-300'}`}>
                                {option.label}
                            </Text>
                            {value === option.value && (
                                <View className="w-2 h-2 rounded-full bg-primary-500" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View className="h-10" />
            </Modal>
        </View>
    );
};

export default Select;
