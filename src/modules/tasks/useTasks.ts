import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { TASKS_QUERIES, TASKS_MUTATIONS } from '../../graphql/queries/tasks';

export interface TaskComment {
    id: string;
    content: string;
    created_at: string;
    user: {
        id: string;
        name: string;
        profile_photo_url?: string;
    };
}

export interface TaskImage {
    id: string;
    image_url: string;
}

export interface Task {
    id: string;
    uuid: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    image_url?: string;
    project_id: string;
    assignee?: {
        id: string;
        name: string;
    };
    comments?: TaskComment[];
    images?: TaskImage[];
    related_type?: string;
    related_id?: string;
    created_at: string;
}

interface TasksResponse {
    tasks: Task[];
}

export function useTasks(projectId: string) {
    const { data, loading, error, refetch } = useQuery<TasksResponse>(TASKS_QUERIES.GET_TASKS, {
        variables: { project_id: projectId },
        skip: !projectId,
        fetchPolicy: 'cache-and-network',
    });

    if (error) {
        console.error("[useTasks] GraphQL Error:", error);
    }

    return {
        tasks: data?.tasks || [],
        loading,
        error: error ? error.message : null,
        refetch,
    };
}

export function useTask(taskId: string) {
    const { data, loading, error, refetch } = useQuery<{ task: Task }>(TASKS_QUERIES.GET_TASK, {
        variables: { id: taskId },
        skip: !taskId,
        fetchPolicy: 'cache-and-network',
    });

    return {
        task: data?.task,
        loading,
        error: error ? error.message : null,
        refetch,
    };
}

export function useCreateTask() {
    const client = useApolloClient();
    return useMutation(TASKS_MUTATIONS.CREATE_TASK, {
        onCompleted: () => client.resetStore(),
    });
}

export function useUpdateTask() {
    const client = useApolloClient();
    return useMutation(TASKS_MUTATIONS.UPDATE_TASK, {
        onCompleted: () => client.resetStore(),
    });
}

export function useCreateTaskComment() {
    return useMutation(TASKS_MUTATIONS.CREATE_TASK_COMMENT);
}
