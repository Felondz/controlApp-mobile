import { gql } from '@apollo/client';

export const INVITATIONS_QUERIES = {
    GET_PENDING_INVITATIONS: gql`
        query GetPendingInvitations {
            user {
                id
                pending_invitations_count
                invitations {
                    id
                    uuid
                    email
                    rol
                    status
                    expires_at
                    invitador {
                        id
                        name
                        email
                    }
                    proyecto {
                        id
                        uuid
                        nombre
                        descripcion
                    }
                }
            }
        }
    `,
};

export const INVITATIONS_MUTATIONS = {
    ACCEPT_INVITATION: gql`
        mutation AcceptInvitation($uuid: String!) {
            acceptInvitation(uuid: $uuid) {
                id
                uuid
                nombre
            }
        }
    `,
    REJECT_INVITATION: gql`
        mutation RejectInvitation($uuid: String!) {
            rejectInvitation(uuid: $uuid)
        }
    `,
};
