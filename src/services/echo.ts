import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from './api';

// Inyectar Pusher en el scope global para compatibilidad con Reverb/Echo
if (typeof window !== 'undefined') {
    (window as any).Pusher = Pusher;
}

let echoInstance: any | null = null;

/**
 * Resuelve el constructor de Echo de forma segura.
 */
const resolveEcho = () => {
    // console.log('[EchoDebug] Echo import type:', typeof Echo);
    
    if (typeof Echo === 'function') return Echo;
    if (Echo && typeof (Echo as any).default === 'function') return (Echo as any).default;

    try {
        const required = require('laravel-echo');
        return required.default || required;
    } catch (e) {}

    return Echo;
};

/**
 * Resuelve el constructor de Pusher de forma segura.
 * En React Native, pusher-js/react-native puede exportar la clase como .default o como .Pusher
 */
const resolvePusher = () => {
    // console.log('[EchoDebug] Pusher import type:', typeof Pusher);
    
    if (typeof Pusher === 'function') return Pusher;
    
    if (Pusher && typeof (Pusher as any).Pusher === 'function') {
        return (Pusher as any).Pusher;
    }
    
    if (Pusher && typeof (Pusher as any).default === 'function') {
        return (Pusher as any).default;
    }
    
    // Si sigue siendo un objeto, intentamos buscar cualquier propiedad que sea una función y se llame Pusher
    if (typeof Pusher === 'object' && Pusher !== null) {
        const keys = Object.keys(Pusher);
        for (const key of keys) {
            if (key.toLowerCase() === 'pusher' && typeof (Pusher as any)[key] === 'function') {
                return (Pusher as any)[key];
            }
        }
    }

    return Pusher;
};

export const getEcho = async (): Promise<any> => {
    if (echoInstance) return echoInstance;

    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const host = process.env.EXPO_PUBLIC_REVERB_HOST || 'ws.ptr.controlapp.site';
        const port = process.env.EXPO_PUBLIC_REVERB_PORT ? parseInt(process.env.EXPO_PUBLIC_REVERB_PORT, 10) : 443;
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://ptr.controlapp.site/api';
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

        const EchoConstructor = resolveEcho();
        const PusherConstructor = resolvePusher();

        // console.log('[EchoDebug] Final EchoConstructor type:', typeof EchoConstructor);
        // console.log('[EchoDebug] Final PusherConstructor type:', typeof PusherConstructor);

        if (typeof EchoConstructor !== 'function') {
            throw new Error(`Invalid Echo constructor type: ${typeof EchoConstructor}`);
        }

        echoInstance = new EchoConstructor({
            broadcaster: 'reverb',
            Pusher: PusherConstructor,
            key: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS: process.env.EXPO_PUBLIC_REVERB_SCHEME === 'https',
            disableStats: true,
            enabledTransports: ['ws', 'wss'],
            authEndpoint: `${baseUrl}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });

        return echoInstance;
    } catch (error) {
        console.error('Failed to initialize Laravel Echo:', error);
        throw error;
    }
};

export const closeEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};
