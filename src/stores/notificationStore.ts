import { create } from 'zustand';
import { notificationsApi } from '../services/api';

export interface Notification {
    id: string;
    uuid: string;
    type: string;
    data: {
        title: string;
        message: string;
        project_uuid?: string;
        action_url?: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    markAsRead: (uuid: string) => void;
    removeNotification: (uuid: string) => void;
    clearProjectNotifications: (projectUuid: string) => void;
    clearAll: () => void;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    setNotifications: (notifications) => set({ 
        notifications, 
        unreadCount: notifications.filter(n => !n.read_at).length 
    }),

    addNotification: (notification) => set((state) => {
        const exists = state.notifications.some(n => n.uuid === notification.uuid);
        if (exists) return state;
        
        return {
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        };
    }),

    markAsRead: (uuid) => set((state) => ({
        notifications: state.notifications.map(n => 
            n.uuid === uuid ? { ...n, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
    })),

    removeNotification: (uuid) => set((state) => {
        const notification = state.notifications.find(n => n.uuid === uuid);
        const wasUnread = notification && !notification.read_at;
        
        return {
            notifications: state.notifications.filter(n => n.uuid !== uuid),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
    }),

    clearProjectNotifications: (projectUuid) => set((state) => {
        const filtered = state.notifications.filter(n => n.data.project_uuid !== projectUuid);
        return {
            notifications: filtered,
            unreadCount: filtered.filter(n => !n.read_at).length
        };
    }),

    clearAll: () => set({ notifications: [], unreadCount: 0 }),

    setUnreadCount: (count) => set({ unreadCount: count }),
}));
