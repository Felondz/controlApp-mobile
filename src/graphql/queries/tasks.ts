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
                image_url
                assignee {
                    id
                    name
                }
                created_at
            }
        }
    `,
    GET_TASK: gql`
        query GetTask($id: ID!) {
            task(id: $id) {
                id
                uuid
                title
                description
                status
                priority
                due_date
                image_url
                project_id
                assignee {
                    id
                    name
                }
                comments {
                    id
                    content
                    created_at
                    user {
                        id
                        name
                        profile_photo_url
                    }
                }
                images {
                    id
                    image_url
                }
                related_type
                related_id
                created_at
            }
        }
    `,
};

export const TASKS_MUTATIONS = {
    CREATE_TASK: gql`
        mutation CreateTask($project_id: ID!, $title: String!, $description: String, $status: String!, $priority: String!, $due_date: String, $assignee_id: ID, $related_type: String, $related_id: ID) {
            createTask(project_id: $project_id, title: $title, description: $description, status: $status, priority: $priority, due_date: $due_date, assignee_id: $assignee_id, related_type: $related_type, related_id: $related_id) {
                id
                uuid
                title
                description
                status
                priority
                due_date
                assignee {
                    id
                    name
                }
                created_at
            }
        }
    `,
    UPDATE_TASK: gql`
        mutation UpdateTask($id: ID!, $status: String, $priority: String, $title: String, $description: String, $due_date: String, $assignee_id: ID) {
            updateTask(id: $id, status: $status, priority: $priority, title: $title, description: $description, due_date: $due_date, assignee_id: $assignee_id) {
                id
                uuid
                status
                priority
                title
                description
                due_date
                assignee {
                    id
                    name
                }
            }
        }
    `,
    CREATE_TASK_COMMENT: gql`
        mutation CreateTaskComment($task_id: ID!, $content: String!) {
            createTaskComment(task_id: $task_id, content: $content) {
                id
                content
                created_at
                user {
                    id
                    name
                    profile_photo_url
                }
            }
        }
    `,
};
