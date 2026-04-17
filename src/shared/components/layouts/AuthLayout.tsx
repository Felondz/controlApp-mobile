import React, { useState } from 'react';
import {
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApplicationLogo } from '../index';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;

    return (
        <SafeAreaView className="flex-1 bg-secondary-50 dark:bg-secondary-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1">
                    {isTablet && (
                        <View className="hidden md:flex flex-1 flex-row">
                            <View className="hidden lg:flex w-1/2 bg-primary-600 dark:bg-primary-800 items-center justify-center p-12">
                                <View className="max-w-md">
                                    <ApplicationLogo size={64} showText={true} />
                                    <View className="mt-8 space-y-4">
                                        <FeatureItem
                                            title="Gestiona tus proyectos"
                                            description="Organiza y controla todos tus proyectos en un solo lugar"
                                        />
                                        <FeatureItem
                                            title="Controla tus finanzas"
                                            description="Seguimiento detallado de ingresos y gastos"
                                        />
                                        <FeatureItem
                                            title="Administra inventario"
                                            description="Gestión eficiente de tu stock y productos"
                                        />
                                    </View>
                                </View>
                            </View>
                            <View className="w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
                                <View className="w-full max-w-md">{children}</View>
                            </View>
                        </View>
                    )}

                    {!isTablet && (
                        <ScrollView
                            contentContainerClassName="flex-grow items-center justify-center p-6"
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View className="w-full max-w-md">{children}</View>
                        </ScrollView>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
    return (
        <View className="flex-row items-start">
            <View className="w-8 h-8 rounded-full bg-primary-500/20 items-center justify-center mr-4 mt-1">
                <View className="w-2 h-2 rounded-full bg-white" />
            </View>
            <View className="flex-1">
                <View className="text-white font-semibold text-lg">{title}</View>
                <View className="text-primary-100 text-base mt-1">{description}</View>
            </View>
        </View>
    );
}
