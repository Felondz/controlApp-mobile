import React from 'react';
import { View, Text } from 'react-native';
import { useTranslate } from '../hooks';
import { CheckCircleIcon } from '../icons';

interface PasswordRequirementsProps {
    password?: string;
}

export default function PasswordRequirements({ password = '' }: PasswordRequirementsProps) {
    const { t } = useTranslate();

    const requirements = [
        {
            key: 'min',
            label: t('auth.password_rule_min', 'Mínimo 8 caracteres'),
            isValid: password.length >= 8
        },
        {
            key: 'letters',
            label: t('auth.password_rule_letters', 'Al menos una letra'),
            isValid: /[a-zA-Z]/.test(password)
        },
        {
            key: 'numbers',
            label: t('auth.password_rule_numbers', 'Al menos un número'),
            isValid: /[0-9]/.test(password)
        },
        {
            key: 'mixed',
            label: t('auth.password_rule_mixed', 'Mayúsculas y minúsculas'),
            isValid: /[a-z]/.test(password) && /[A-Z]/.test(password)
        }
    ];

    return (
        <View className="mt-2 mb-4 p-4 bg-white dark:bg-secondary-800/50 rounded-2xl border border-secondary-100 dark:border-secondary-800 shadow-sm">
            <Text className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-3">
                {t('auth.password_requirements_title', 'Requerimientos de Seguridad')}
            </Text>
            <View className="gap-2">
                {requirements.map((req) => (
                    <View key={req.key} className="flex-row items-center">
                        <View className="mr-3">
                            {req.isValid ? (
                                <CheckCircleIcon size={16} color="#10b981" />
                            ) : (
                                <View className="w-4 h-4 rounded-full border-2 border-secondary-200 dark:border-secondary-700 opacity-60" />
                            )}
                        </View>
                        <Text className={`text-xs ${req.isValid ? 'text-green-600 dark:text-green-400 font-bold' : 'text-secondary-500 dark:text-secondary-400 font-medium'}`}>
                            {req.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
