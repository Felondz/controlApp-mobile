import LaravelEcho from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from './api';

/**
 * Función defensiva para resolver el constructor de Echo.
 * Metro Bundler en React Native a veces envuelve las exportaciones ESM en objetos.
 */
const resolveEchoConstructor = () => {
    // 1. Intentar la importación directa (ESM)
    if (typeof LaravelEcho === 'function') return LaravelEcho;
    
    // 2. Intentar acceder a la propiedad default (Interoperabilidad ESM/CJS)
    if (LaravelEcho && typeof (LaravelEcho as any).default === 'function') {
        return (LaravelEcho as any).default;
    }

    // 3. Último recurso: require dinámico (CommonJS)
    try {
        const requiredEcho = require('laravel-echo');
        if (typeof requiredEcho === 'function') return requiredEcho;
        if (requiredEcho && typeof requiredEcho.default === 'function') return requiredEcho.default;
    } catch (e) {
        console.warn('Fallo al intentar require de laravel-echo:', e);
    }

    throw new Error('No se pudo resolver el constructor de Laravel Echo. Revisa la instalación de laravel-echo.');
};

// Inyectar Pusher en el scope global para compatibilidad con Reverb
(window as any).Pusher = Pusher;

let echoInstance: any | null = null;

export const getEcho = async (): Promise<any> => {
    if (echoInstance) return echoInstance;

    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const host = process.env.EXPO_PUBLIC_REVERB_HOST || 'ws.ptr.controlapp.site';
    const port = process.env.EXPO_PUBLIC_REVERB_PORT ? parseInt(process.env.EXPO_PUBLIC_REVERB_PORT, 10) : 443;
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://ptr.controlapp.site/api';
    
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    try {
        const EchoConstructor = resolveEchoConstructor();
        
        echoInstance = new EchoConstructor({
            broadcaster: 'reverb',
            Pusher: Pusher, // Pasar el constructor con 'P' mayúscula para que Echo instancie
            key: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS: process.env.EXPO_PUBLIC_REVERB_SCHEME === 'https',
            disableStats: true,
            authEndpoint: `${baseUrl}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });
    } catch (error) {
        console.error('Failed to instantiate Echo:', error);
        throw error;
    }

    return echoInstance;
};

export const closeEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};
