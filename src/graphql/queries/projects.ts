export const PROJECT_QUERIES = {
    GET_PROJECTS: `
        query GetProjects {
            projects {
                id
                uuid
                nombre
                descripcion
                user_id
                modules
            }
        }
    `,
    GET_PROJECT: `
        query GetProject($id: ID!) {
            project(id: $id) {
                id
                uuid
                nombre
                descripcion
                user_id
                modules
            }
        }
    `,
};
