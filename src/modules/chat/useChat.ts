import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getEcho } from '../../services/echo';
import { Message } from '../../types';
import { useAuthStore } from '../../stores/authStore';

export function useChat(projectId?: number) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const appState = useRef(AppState.currentState);

    // Initial Fetch (Mock)
    useEffect(() => {
        if (!projectId) return;

        setLoading(true);
        setTimeout(() => {
            const mockMessages: Message[] = [];
            setMessages(mockMessages);
            setLoading(false);
        }, 1000);
    }, [projectId]);

    // Echo Connection Manager
    useEffect(() => {
        if (!projectId) return;

        let echoInstance: any;

        const connectAndListen = async () => {
            try {
                echoInstance = await getEcho();
                // Conectar explícitamente si estaba desconectado
                if (echoInstance.connector.pusher.connection.state === 'disconnected') {
                    echoInstance.connector.pusher.connect();
                }

                const channel = echoInstance.join(`project.${projectId}.chat`);

                channel.listen('.App\\Modules\\Chat\\Events\\MessageUpdated', (e: { message: Message }) => {
                    setMessages(prev => prev.map(m => m.id === e.message.id ? e.message : m));
                });

                channel.listen('.App\\Modules\\Chat\\Events\\MessageDeleted', (e: { messageId: string }) => {
                    setMessages(prev => prev.filter(m => m.id !== e.messageId));
                });

                channel.listen('.App\\Modules\\Chat\\Events\\MessageSent', (e: { message: Message }) => {
                    setMessages(prev => {
                        if (prev.find(m => m.id === e.message.id)) return prev;
                        return [e.message, ...prev];
                    });
                });
            } catch (error) {
                console.error("Error connecting to chat websocket:", error);
            }
        };

        const disconnect = () => {
            if (echoInstance && projectId) {
                echoInstance.leave(`project.${projectId}.chat`);
                // Opcional: echoInstance.disconnect() si quieres apagar todo el socket
            }
        };

        // 1. Conectar al montar
        connectAndListen();

        // 2. Gestionar estado de la aplicación (Background/Foreground)
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('App ha vuelto al primer plano. Reconectando WebSocket...');
                connectAndListen();
                
                // TODO: Idealmente aquí deberías hacer un refetch (REST/GraphQL) 
                // para obtener los mensajes perdidos mientras la app dormía.
            } else if (nextAppState === 'background') {
                console.log('App en segundo plano. Desconectando WebSocket para ahorrar batería...');
                disconnect();
            }
            appState.current = nextAppState;
        });

        // 3. Limpiar al desmontar
        return () => {
            disconnect();
            subscription.remove();
        };
    }, [projectId]);

    const sendMessage = useCallback(async (content: string, parentId?: string) => {
        if (!user) return;
        
        const newMessage: Message = {
            id: Date.now().toString(),
            content,
            user_id: user.id,
            user: { ...user },
            parent_id: parentId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setMessages(prev => [newMessage, ...prev]);
    }, [user]);

    const deleteMessage = useCallback(async (messageId: string) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
    }, []);

    const updateMessage = useCallback(async (messageId: string, content: string) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content, updated_at: new Date().toISOString() } : m));
    }, []);

    return {
        messages,
        loading,
        sendMessage,
        deleteMessage,
        updateMessage,
    };
}
