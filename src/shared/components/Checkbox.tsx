import { TouchableOpacity, Text, View } from 'react-native';
import { CheckIcon } from '../icons';
import { getTheme } from '../themes';
import { useSettingsStore } from '../../stores/settingsStore';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export const Checkbox = ({ checked, onChange, label }: CheckboxProps) => {
    const { theme } = useSettingsStore();
    const themeColors = getTheme(theme);

    return (
        <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => onChange(!checked)}
            activeOpacity={0.7}
        >
            <View
                className={`w-5 h-5 rounded border items-center justify-center ${checked
                        ? 'bg-[--theme-primary] border-[--theme-primary]'
                        : 'border-gray-300 dark:border-gray-600 bg-transparent'
                    }`}
                style={checked ? { backgroundColor: themeColors.primary500, borderColor: themeColors.primary500 } : {}}
            >
                {checked && <CheckIcon size={14} color="white" />}
            </View>
            {label && (
                <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};
