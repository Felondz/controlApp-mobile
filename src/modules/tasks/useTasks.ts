import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { TASKS_QUERIES, TASKS_MUTATIONS } from '../../graphql/queries/tasks';

export interface Task {
    id: string;
    uuid: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    project_id: string;
    assignee?: {
        id: string;
        uuid: string;
        name: string;
    };
    created_at: string;
}

interface TasksResponse {
    tasks: Task[];
}

export function useTasks(projectId: string) {
    const { data, loading, error, refetch } = useQuery<TasksResponse>(TASKS_QUERIES.GET_TASKS, {
        variables: { project_id: projectId },
        skip: !projectId,
    });

    return {
        tasks: data?.tasks || [],
        loading,
        error: error ? error.message : null,
        refetch,
    };
}

export function useUpdateTask() {
    const client = useApolloClient();
    return useMutation(TASKS_MUTATIONS.UPDATE_TASK, {
        onCompleted: () => client.resetStore(),
    });
}
