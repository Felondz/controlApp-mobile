import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { getEcho } from '../../services/echo';
import { Message } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { CHAT_QUERIES, CHAT_MUTATIONS } from '../../graphql/queries/chat';

interface MessagesResponse {
    messages: Message[];
}

export function useChat(projectId?: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const { user } = useAuthStore();
    const appState = useRef(AppState.currentState);
    const client = useApolloClient();

    // GraphQL Query for initial messages
    const { loading, refetch } = useQuery<MessagesResponse>(CHAT_QUERIES.GET_MESSAGES, {
        variables: { proyectoId: projectId },
        skip: !projectId,
        onCompleted: (data) => {
            setMessages(data.messages || []);
        },
    });

    // GraphQL Mutation for sending messages
    const [sendMessageMutation] = useMutation(CHAT_MUTATIONS.SEND_MESSAGE);

    // Echo Connection Manager
    useEffect(() => {
        if (!projectId) return;

        let echoInstance: any;

        const connectAndListen = async () => {
            try {
                echoInstance = await getEcho();
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
            }
        };

        connectAndListen();

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('App ha vuelto al primer plano. Reconectando WebSocket...');
                connectAndListen();
                refetch(); // Fetch latest messages
            } else if (nextAppState === 'background') {
                console.log('App en segundo plano. Desconectando WebSocket...');
                disconnect();
            }
            appState.current = nextAppState;
        });

        return () => {
            disconnect();
            subscription.remove();
        };
    }, [projectId, refetch]);

    const sendMessage = useCallback(async (content: string) => {
        if (!user || !projectId) return;
        
        try {
            await sendMessageMutation({
                variables: { content, proyectoId: projectId }
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }, [user, projectId, sendMessageMutation]);

    const deleteMessage = useCallback(async (messageId: string) => {
        // Placeholder for delete mutation if needed
        setMessages(prev => prev.filter(m => m.id !== messageId));
    }, []);

    const updateMessage = useCallback(async (messageId: string, content: string) => {
        // Placeholder for update mutation if needed
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content, updated_at: new Date().toISOString() } : m));
    }, []);

    return {
        messages,
        loading,
        sendMessage,
        deleteMessage,
        updateMessage,
        refetch,
    };
}
