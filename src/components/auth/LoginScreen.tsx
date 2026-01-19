/**
 * Login Screen Component
 * Responsive design for phone and tablet
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { getTheme } from '../../shared/themes';

interface LoginScreenProps {
    onNavigateToRegister?: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();
    const { width } = useWindowDimensions();

    // Responsive: tablet uses split layout
    const isTablet = width >= 768;
    const theme = getTheme('purple-modern');

    const handleLogin = async () => {
        if (!email || !password) {
            return;
        }
        await login(email, password);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-50"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className={`flex-1 ${isTablet ? 'flex-row' : ''}`}>
                    {/* Branding Section - visible on tablet as left side */}
                    {isTablet && (
                        <View
                            className="flex-1 justify-center items-center p-12"
                            style={{ backgroundColor: theme.primary500 }}
                        >
                            <Text className="text-5xl font-bold text-white mb-4">
                                ControlApp
                            </Text>
                            <Text className="text-xl text-white/80 text-center">
                                Gestiona tus proyectos,{'\n'}finanzas e inventario
                            </Text>
                        </View>
                    )}

                    {/* Form Section */}
                    <View className={`flex-1 justify-center px-6 ${isTablet ? 'px-16' : 'py-12'}`}>
                        {/* Mobile header */}
                        {!isTablet && (
                            <View className="items-center mb-8">
                                <Text
                                    className="text-4xl font-bold mb-2"
                                    style={{ color: theme.primary600 }}
                                >
                                    ControlApp
                                </Text>
                                <Text className="text-gray-500 text-base">
                                    Inicia sesión para continuar
                                </Text>
                            </View>
                        )}

                        {/* Tablet header */}
                        {isTablet && (
                            <View className="mb-8">
                                <Text className="text-3xl font-bold text-gray-800 mb-2">
                                    Bienvenido de nuevo
                                </Text>
                                <Text className="text-gray-500 text-base">
                                    Inicia sesión en tu cuenta
                                </Text>
                            </View>
                        )}

                        {/* Error message */}
                        {error && (
                            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <Text className="text-red-600 text-center">{error}</Text>
                                <TouchableOpacity onPress={clearError} className="mt-2">
                                    <Text className="text-red-400 text-center text-sm">Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Email Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium mb-2">
                                Correo electrónico
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
                                placeholder="tu@email.com"
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        {/* Password Input */}
                        <View className="mb-6">
                            <Text className="text-gray-700 font-medium mb-2">
                                Contraseña
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
                                placeholder="••••••••"
                                placeholderTextColor="#9ca3af"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password"
                            />
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            className="rounded-xl py-4 items-center mb-4"
                            style={{ backgroundColor: theme.primary500 }}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-semibold text-lg">
                                    Iniciar Sesión
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View className="flex-row justify-center mt-4">
                            <Text className="text-gray-500">¿No tienes cuenta? </Text>
                            <TouchableOpacity onPress={onNavigateToRegister}>
                                <Text style={{ color: theme.primary600 }} className="font-semibold">
                                    Regístrate
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
