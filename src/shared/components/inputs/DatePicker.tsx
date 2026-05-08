import React, { useState } from 'react';
import { View, Pressable, Platform, Text, Modal as RNModal, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Input from '../Input';
import { CalendarIcon, XIcon } from '../../icons';
import { useAppTheme } from '../../hooks/useAppTheme';

// Configure Spanish locale
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

interface DatePickerProps {
    label: string;
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
}

export const DatePicker = ({ 
    label, 
    value, 
    onChange, 
    error, 
    required, 
    placeholder = 'YYYY-MM-DD' 
}: DatePickerProps) => {
    const [show, setShow] = useState(false);
    const { theme, isDark } = useAppTheme();

    const handleDayPress = (day: any) => {
        onChange(day.dateString);
        setShow(false);
    };

    return (
        <View>
            <Pressable onPress={() => setShow(true)}>
                <View pointerEvents="none">
                    <Input
                        label={label}
                        placeholder={placeholder}
                        value={value}
                        editable={false}
                        error={error}
                        required={required}
                        icon={CalendarIcon}
                    />
                </View>
            </Pressable>

            <RNModal
                visible={show}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShow(false)}
            >
                <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={() => setShow(false)}
                    className="flex-1 bg-black/60 justify-center items-center p-4"
                >
                    <TouchableOpacity 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-white dark:bg-secondary-900 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-800">
                            <Text className="text-lg font-black text-secondary-900 dark:text-secondary-50">
                                {label}
                            </Text>
                            <TouchableOpacity onPress={() => setShow(false)}>
                                <XIcon size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </TouchableOpacity>
                        </View>

                        <Calendar
                            current={value || undefined}
                            onDayPress={handleDayPress}
                            markedDates={{
                                [value]: { selected: true, disableTouchEvent: true, selectedColor: theme.primary600 }
                            }}
                            theme={{
                                backgroundColor: isDark ? '#111827' : '#ffffff',
                                calendarBackground: isDark ? '#111827' : '#ffffff',
                                textSectionTitleColor: isDark ? '#9ca3af' : '#6b7280',
                                selectedDayBackgroundColor: theme.primary600,
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: theme.primary600,
                                dayTextColor: isDark ? '#f3f4f6' : '#1f2937',
                                textDisabledColor: isDark ? '#374151' : '#d1d5db',
                                dotColor: theme.primary600,
                                selectedDotColor: '#ffffff',
                                arrowColor: theme.primary600,
                                monthTextColor: isDark ? '#f3f4f6' : '#111827',
                                indicatorColor: theme.primary600,
                                textDayFontWeight: '600',
                                textMonthFontWeight: '900',
                                textDayHeaderFontWeight: '700',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 12,
                            }}
                        />
                        
                        <View className="p-4 bg-secondary-50 dark:bg-secondary-950/50 flex-row justify-end">
                            <TouchableOpacity 
                                onPress={() => setShow(false)}
                                className="px-6 py-3 rounded-2xl bg-secondary-200 dark:bg-secondary-800"
                            >
                                <Text className="font-bold text-secondary-700 dark:text-secondary-300">Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </RNModal>
        </View>
    );
};

export default DatePicker;
