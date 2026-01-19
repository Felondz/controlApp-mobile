import "./global.css";
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from './src/stores/authStore';
import LoginScreen from './src/components/auth/LoginScreen';
import RegisterScreen from './src/components/auth/RegisterScreen';
import { getTheme } from './src/shared/themes';

type AuthScreen = 'login' | 'register';

export default function App() {
  const { isAuthenticated, isLoading, initialize, user, logout } = useAuthStore();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const theme = getTheme('purple-modern');

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={theme.primary500} />
        <Text className="text-gray-500 mt-4">Cargando...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  // Not authenticated - show auth screens
  if (!isAuthenticated) {
    if (authScreen === 'login') {
      return (
        <>
          <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
          <StatusBar style="auto" />
        </>
      );
    }
    return (
      <>
        <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
        <StatusBar style="auto" />
      </>
    );
  }

  // Authenticated - show home (placeholder for now)
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        ¡Bienvenido, {user?.name}! 🎉
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Has iniciado sesión correctamente.{'\n'}
        La navegación se implementará pronto.
      </Text>
      <View
        className="rounded-xl px-6 py-3"
        style={{ backgroundColor: theme.primary100 }}
      >
        <Text style={{ color: theme.primary700 }} className="font-medium">
          {user?.email}
        </Text>
      </View>
      <Text
        className="mt-8 font-semibold"
        style={{ color: theme.primary600 }}
        onPress={logout}
      >
        Cerrar sesión
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
