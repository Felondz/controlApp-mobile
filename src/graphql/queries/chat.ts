import { gql } from '@apollo/client';

export const CHAT_QUERIES = {
    GET_MESSAGES: gql`
        query GetMessages($proyectoId: ID!) {
            messages(proyecto_id: $proyectoId) {
                id
                content
                created_at
                updated_at
                user {
                    id
                    name
                }
            }
        }
    `,
};

export const CHAT_MUTATIONS = {
    SEND_MESSAGE: gql`
        mutation SendMessage($content: String!, $proyectoId: ID) {
            sendMessage(content: $content, proyecto_id: $proyectoId) {
                id
                content
                created_at
                user {
                    id
                    name
                }
            }
        }
    `,
};
