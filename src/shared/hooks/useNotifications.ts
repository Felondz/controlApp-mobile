import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import { getEcho } from '../../services/echo';
import { notificationsApi } from '../../services/api';

export function useNotifications() {
    const { user } = useAuthStore();
    const { 
        addNotification, 
        removeNotification, 
        clearProjectNotifications, 
        setNotifications,
        setUnreadCount
    } = useNotificationStore();

    const fetchNotifications = useCallback(async () => {
        // Here we could fetch from REST if needed, but usually it comes from dashboard/me query
        // For now let's assume we just want to listen to real-time events
    }, []);

    const deleteNotification = useCallback(async (uuid: string) => {
        try {
            await notificationsApi.delete(uuid);
            removeNotification(uuid);
        } catch (error) {
            console.error('[useNotifications] Error deleting notification:', error);
        }
    }, [removeNotification]);

    const clearAll = useCallback(async (projectUuid?: string) => {
        try {
            await notificationsApi.clearAll(projectUuid);
            if (projectUuid) {
                clearProjectNotifications(projectUuid);
            } else {
                useNotificationStore.getState().clearAll();
            }
        } catch (error) {
            console.error('[useNotifications] Error clearing notifications:', error);
        }
    }, [clearProjectNotifications]);

    useEffect(() => {
        if (!user) return;

        let echo: any = null;

        const setupEvents = async () => {
            echo = await getEcho();
            
            echo.private(`App.Models.User.${user.id}`)
                .listen('.notification', (e: any) => {
                    console.log('[Realtime] New Notification:', e);
                    addNotification({
                        id: e.id || Math.random().toString(),
                        uuid: e.uuid || e.id,
                        type: e.type,
                        data: e.data || e,
                        read_at: null,
                        created_at: new Date().toISOString(),
                    });
                })
                .listen('.NotificationsCleared', (e: any) => {
                    console.log('[Realtime] Notifications Cleared Sync:', e);
                    if (e.project_uuid) {
                        clearProjectNotifications(e.project_uuid);
                    } else {
                        useNotificationStore.getState().clearAll();
                    }
                });
        };

        setupEvents();

        return () => {
            if (echo) {
                echo.leave(`App.Models.User.${user.id}`);
            }
        };
    }, [user, addNotification, clearProjectNotifications]);

    return {
        deleteNotification,
        clearAll,
        fetchNotifications
    };
}
