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
    ScrollView,
} from 'react-native';
import { useAppTheme } from '../hooks';
import { ThemedScrollView } from './ThemedScrollView';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: ModalSize;
    closeable?: boolean;
    scrollable?: boolean;
    style?: ViewStyle;
    title?: string;
    headerBackgroundColor?: string;
    headerTextColor?: string;
}

const sizeWidths: Record<ModalSize, number> = {
    sm: 360,
    md: 480,
    lg: 640,
    xl: 800,
    full: 9999,
};

export function Modal({
    visible,
    onClose,
    children,
    size = 'md',
    closeable = true,
    scrollable = true,
    style,
    title,
    headerBackgroundColor,
    headerTextColor,
}: ModalProps) {
    const { isDark } = useAppTheme();
    const screenWidth = Dimensions.get('window').width;
    const isFull = size === 'full';
    const maxWidth = isFull ? screenWidth - 24 : Math.min(sizeWidths[size], screenWidth - 32);

    const handleBackdropPress = () => {
        if (closeable) {
            onClose();
        }
    };

    const content = scrollable ? (
        <ThemedScrollView 
            className={title ? '' : 'p-2'}
            bounces={false}
            style={{ flex: 0, flexGrow: 0, flexShrink: 1, minHeight: 1 }}
            keyboardShouldPersistTaps="handled"
        >
            {children}
        </ThemedScrollView>
    ) : (
        <View className={title ? 'flex-1' : 'flex-1 p-2'}>
            {children}
        </View>
    );

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
                        padding: 12,
                    }}
                >
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                            className="flex-1 w-full items-center justify-center"
                        >
                            <View
                                className="bg-white dark:bg-secondary-900 rounded-3xl overflow-hidden shadow-2xl"
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
                                        className="flex-row items-center justify-between px-6 py-5 border-b border-secondary-100 dark:border-secondary-800"
                                        style={headerBackgroundColor ? { backgroundColor: headerBackgroundColor, borderBottomWidth: 0 } : null}
                                    >
                                        <Text 
                                            className="text-xl font-black text-secondary-900 dark:text-white tracking-tight"
                                            style={headerTextColor ? { color: headerTextColor } : { color: isDark ? '#ffffff' : '#111827' }}
                                        >
                                            {title}
                                        </Text>
                                        {closeable && (
                                            <TouchableOpacity 
                                                onPress={onClose} 
                                                className="w-10 h-10 rounded-xl items-center justify-center active:scale-95 transition-all"
                                                style={{ backgroundColor: headerBackgroundColor ? 'rgba(255,255,255,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') }}
                                            >
                                                <Text 
                                                    className="text-secondary-500 dark:text-secondary-400 text-xl font-bold"
                                                    style={headerTextColor ? { color: headerTextColor } : null}
                                                >
                                                    ✕
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                                {content}
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
}

export default Modal;
