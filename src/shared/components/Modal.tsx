/**
 * Modal Component - Design System
 * Matches web Modal.jsx with animated backdrop and content
 */
import React from 'react';
import {
    Modal as RNModal,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
    Dimensions,
} from 'react-native';
import { useAppTheme } from '../hooks';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: ModalSize;
    closeable?: boolean;
    style?: ViewStyle;
    title?: string;
    headerBackgroundColor?: string;
    headerTextColor?: string;
}

const sizeWidths: Record<ModalSize, number> = {
    sm: 320,
    md: 400,
    lg: 500,
    xl: 600,
    full: 9999,
};

export function Modal({
    visible,
    onClose,
    children,
    size = 'md',
    closeable = true,
    style,
    title,
    headerBackgroundColor,
    headerTextColor,
}: ModalProps) {
    const { isDark } = useAppTheme();
    const screenWidth = Dimensions.get('window').width;
    const isFull = size === 'full';
    const maxWidth = isFull ? screenWidth - 32 : Math.min(sizeWidths[size], screenWidth - 32);

    const handleBackdropPress = () => {
        if (closeable) {
            onClose();
        }
    };

    return (
        <RNModal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={closeable ? onClose : undefined}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 16,
                    }}
                >
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        >
                            <View
                                className="bg-white dark:bg-secondary-900 rounded-2xl overflow-hidden shadow-2xl"
                                style={[
                                    {
                                        width: maxWidth,
                                        maxHeight: '90%',
                                    },
                                    style,
                                ]}
                            >
                                {title && (
                                    <View 
                                        className="flex-row items-center justify-between px-6 py-4 border-b border-secondary-100 dark:border-secondary-800"
                                        style={headerBackgroundColor ? { backgroundColor: headerBackgroundColor, borderBottomWidth: 0 } : null}
                                    >
                                        <Text 
                                            className="text-lg font-black text-secondary-900 dark:text-white tracking-tight"
                                            style={headerTextColor ? { color: headerTextColor } : { color: isDark ? '#ffffff' : '#111827' }}
                                        >
                                            {title}
                                        </Text>
                                        {closeable && (
                                            <TouchableOpacity 
                                                onPress={onClose} 
                                                className="w-8 h-8 rounded-lg items-center justify-center active:scale-95 transition-all"
                                                style={{ backgroundColor: headerBackgroundColor ? 'rgba(255,255,255,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') }}
                                            >
                                                <Text 
                                                    className="text-secondary-500 dark:text-secondary-400 text-base font-bold"
                                                    style={headerTextColor ? { color: headerTextColor } : null}
                                                >
                                                    ✕
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                                <View className={title ? '' : 'p-2'}>
                                    {children}
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
}

export default Modal;
