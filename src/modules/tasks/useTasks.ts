import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../../services/api';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    project_id: number;
    assigned_to?: number;
    assigned?: {
        id: number;
        name: string;
        email: string;
    };
}

export function useTasks(projectId: number) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await tasksApi.getAll(projectId);
            // According to TasksSummaryWidget: Array.isArray(response.data) ? response.data : response.data.data;
            const data = Array.isArray(response.data) ? response.data : response.data.data;
            setTasks(data || []);
        } catch (err) {
            console.error(`Failed to fetch tasks for project ${projectId}:`, err);
            setError('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks,
        loading,
        error,
        refetch: fetchTasks,
    };
}
