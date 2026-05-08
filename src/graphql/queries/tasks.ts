import { gql } from '@apollo/client';

export const TASKS_QUERIES = {
    GET_TASKS: gql`
        query GetTasks($project_id: ID!) {
            tasks(project_id: $project_id) {
                id
                uuid
                title
                description
                status
                priority
                due_date
                assignee {
                    id
                    uuid
                    name
                }
                created_at
            }
        }
    `,
};

export const TASKS_MUTATIONS = {
    UPDATE_TASK: gql`
        mutation UpdateTask($id: ID!, $status: String!) {
            updateTask(id: $id, status: $status) {
                id
                status
            }
        }
    `,
};
