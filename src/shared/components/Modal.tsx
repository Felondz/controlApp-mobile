/**
 * Modal Component - Design System
 * Matches web Modal.jsx with animated backdrop and content
 */
import React from 'react';
import {
    Modal as RNModal,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
    Dimensions,
} from 'react-native';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: ModalSize;
    closeable?: boolean;
    style?: ViewStyle;
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
}: ModalProps) {
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
                                style={[
                                    {
                                        backgroundColor: '#ffffff',
                                        borderRadius: 16,
                                        width: maxWidth,
                                        maxHeight: '90%',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 12,
                                        elevation: 8,
                                    },
                                    style,
                                ]}
                            >
                                {children}
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
}

export default Modal;
