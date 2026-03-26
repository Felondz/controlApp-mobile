export const OPERATIONS_QUERIES = {
    GET_PRODUCTION_PROCESSES: `
        query GetProductionProcesses($proyecto_id: ID!, $first: Int = 15, $page: Int) {
            productionProcesses(proyecto_id: $proyecto_id, first: $first, page: $page) {
                paginatorInfo {
                    count
                    currentPage
                    firstItem
                    hasMorePages
                    lastItem
                    lastPage
                    perPage
                    total
                }
                data {
                    id
                    proyecto_id
                    name
                    description
                    inventory_item_id
                    outputProduct {
                        id
                        name
                        type
                        unit
                    }
                    etapas {
                        id
                        production_process_id
                        name
                        description
                        order
                        inputTemplates {
                            id
                            etapa_proceso_id
                            inventory_item_id
                            quantity
                            item {
                                id
                                name
                            }
                        }
                    }
                    created_at
                    updated_at
                }
            }
        }
    `,

    GET_PRODUCTION_PROCESS: `
        query GetProductionProcess($id: ID!) {
            productionProcess(id: $id) {
                id
                proyecto_id
                name
                description
                inventory_item_id
                outputProduct {
                    id
                    name
                    type
                    unit
                }
                etapas {
                    id
                    production_process_id
                    name
                    description
                    order
                    inputTemplates {
                        id
                        etapa_proceso_id
                        inventory_item_id
                        quantity
                        item {
                            id
                            name
                        }
                    }
                }
                lotes {
                    id
                    code
                    status
                    current_quantity
                    start_date
                }
                created_at
                updated_at
            }
        }
    `,

    GET_LOTE_PRODUCCIONES: `
        query GetLoteProducciones($proyecto_id: ID!, $first: Int = 15, $page: Int, $status: String) {
            loteProducciones(proyecto_id: $proyecto_id, first: $first, page: $page, status: $status) {
                paginatorInfo {
                    count
                    currentPage
                    firstItem
                    hasMorePages
                    lastItem
                    lastPage
                    perPage
                    total
                }
                data {
                    id
                    proyecto_id
                    production_process_id
                    stage_id
                    inventory_item_id
                    code
                    initial_quantity
                    current_quantity
                    start_date
                    end_date
                    assigned_to
                    notes
                    status
                    stage {
                        id
                        name
                        order
                        description
                    }
                    productionProcess {
                        id
                        name
                    }
                    inputs {
                        id
                        inventory_item_id
                        quantity
                        cost
                        product {
                            id
                            name
                            unit
                        }
                    }
                    created_at
                    updated_at
                }
            }
        }
    `,

    GET_LOTE_PRODUCCION: `
        query GetLoteProduccion($id: ID!) {
            loteProduccion(id: $id) {
                id
                proyecto_id
                production_process_id
                stage_id
                inventory_item_id
                code
                initial_quantity
                current_quantity
                start_date
                end_date
                assigned_to
                notes
                status
                stage {
                    id
                    name
                    order
                    description
                }
                productionProcess {
                    id
                    name
                    etapas {
                        id
                        name
                        order
                    }
                }
                inputs {
                    id
                    lote_produccion_id
                    inventory_item_id
                    quantity
                    cost
                    notes
                    product {
                        id
                        name
                        unit
                        current_stock
                    }
                    created_at
                }
                created_at
                updated_at
            }
        }
    `,
};

export const OPERATIONS_MUTATIONS = {
    CREATE_PRODUCTION_PROCESS: `
        mutation CreateProductionProcess(
            $proyecto_id: ID!
            $name: String!
            $description: String
            $inventory_item_id: ID
        ) {
            createProductionProcess(
                proyecto_id: $proyecto_id
                name: $name
                description: $description
                inventory_item_id: $inventory_item_id
            ) {
                id
                proyecto_id
                name
                description
                inventory_item_id
                created_at
            }
        }
    `,

    UPDATE_PRODUCTION_PROCESS: `
        mutation UpdateProductionProcess(
            $id: ID!
            $proyecto_id: ID!
            $name: String!
            $description: String
            $inventory_item_id: ID
        ) {
            updateProductionProcess(
                id: $id
                proyecto_id: $proyecto_id
                name: $name
                description: $description
                inventory_item_id: $inventory_item_id
            ) {
                id
                proyecto_id
                name
                description
                inventory_item_id
                updated_at
            }
        }
    `,

    DELETE_PRODUCTION_PROCESS: `
        mutation DeleteProductionProcess($id: ID!, $proyecto_id: ID!) {
            deleteProductionProcess(id: $id, proyecto_id: $proyecto_id)
        }
    `,

    CREATE_LOTE: `
        mutation CreateLote(
            $proyecto_id: ID!
            $production_process_id: ID!
            $start_date: DateTime!
            $assigned_to: ID
            $notes: String
        ) {
            createLote(
                proyecto_id: $proyecto_id
                production_process_id: $production_process_id
                start_date: $start_date
                assigned_to: $assigned_to
                notes: $notes
            ) {
                id
                proyecto_id
                production_process_id
                code
                status
                current_quantity
                start_date
            }
        }
    `,

    UPDATE_LOTE: `
        mutation UpdateLote(
            $id: ID!
            $proyecto_id: ID!
            $start_date: DateTime!
            $assigned_to: ID
            $notes: String
        ) {
            updateLote(
                id: $id
                proyecto_id: $proyecto_id
                start_date: $start_date
                assigned_to: $assigned_to
                notes: $notes
            ) {
                id
                start_date
                assigned_to
                notes
            }
        }
    `,

    UPDATE_LOTE_STAGE: `
        mutation UpdateLoteStage(
            $id: ID!
            $proyecto_id: ID!
            $stage_id: ID!
            $waste_quantity: Float
            $notes: String
        ) {
            updateLoteStage(
                id: $id
                proyecto_id: $proyecto_id
                stage_id: $stage_id
                waste_quantity: $waste_quantity
                notes: $notes
            ) {
                id
                stage_id
                status
                current_quantity
                stage {
                    id
                    name
                    order
                }
            }
        }
    `,

    FINISH_LOTE: `
        mutation FinishLote($id: ID!, $proyecto_id: ID!, $final_quantity: Float!) {
            finishLote(id: $id, proyecto_id: $proyecto_id, final_quantity: $final_quantity) {
                id
                status
                current_quantity
                end_date
            }
        }
    `,

    DISCARD_LOTE: `
        mutation DiscardLote($id: ID!, $proyecto_id: ID!, $reason: String!) {
            discardLote(id: $id, proyecto_id: $proyecto_id, reason: $reason) {
                id
                status
            }
        }
    `,

    ADD_LOTE_INPUT: `
        mutation AddLoteInput(
            $id: ID!
            $proyecto_id: ID!
            $inventory_item_id: ID!
            $quantity: Float!
            $notes: String
        ) {
            addLoteInput(
                id: $id
                proyecto_id: $proyecto_id
                inventory_item_id: $inventory_item_id
                quantity: $quantity
                notes: $notes
            ) {
                id
                quantity
                cost
                product {
                    id
                    name
                }
            }
        }
    `,

    CONSUME_LOTE_INPUT: `
        mutation ConsumeLoteInput($input_id: ID!, $proyecto_id: ID!, $quantity: Float!) {
            consumeLoteInput(input_id: $input_id, proyecto_id: $proyecto_id, quantity: $quantity) {
                id
                quantity
            }
        }
    `,
};
