import { gql } from '@apollo/client';

export const GET_INVENTORY_ITEMS = gql`
    query GetInventoryItems($proyecto_id: ID!, $name: String, $type: String, $is_active: Boolean, $first: Int = 15, $page: Int) {
        inventoryItems(proyecto_id: $proyecto_id, name: $name, type: $type, is_active: $is_active, first: $first, page: $page) {
            paginatorInfo {
                currentPage
                lastPage
                perPage
                total
                hasMorePages
            }
            data {
                id
                proyecto_id
                name
                sku
                type
                unit
                current_stock
                min_stock_level
                cost_price
                sale_price
                image_path
                is_active
                created_at
                updated_at
            }
        }
    }
`;

export const GET_INVENTORY_ITEM = gql`
    query GetInventoryItem($id: ID!) {
        inventoryItem(id: $id) {
            id
            proyecto_id
            name
            sku
            type
            unit
            current_stock
            min_stock_level
            cost_price
            sale_price
            image_path
            is_active
            created_at
            updated_at
        }
    }
`;

export const GET_PRODUCTION_PROCESSES = gql`
    query GetProductionProcesses($proyecto_id: ID!, $first: Int = 15, $page: Int) {
        productionProcesses(proyecto_id: $proyecto_id, first: $first, page: $page) {
            paginatorInfo {
                currentPage
                lastPage
                perPage
                total
                hasMorePages
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
                    current_stock
                    sale_price
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
                            type
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
    }
`;

export const GET_PRODUCTION_PROCESS = gql`
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
                current_stock
                sale_price
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
                        type
                        unit
                        current_stock
                    }
                }
            }
            lotes {
                id
                code
                status
                current_quantity
                initial_quantity
                start_date
                end_date
                notes
                stage {
                    id
                    name
                    order
                }
                inputs {
                    id
                    inventory_item_id
                    quantity
                    cost
                    product {
                        id
                        name
                        type
                    }
                }
            }
            created_at
            updated_at
        }
    }
`;

export const GET_LOTE_PRODUCCIONES = gql`
    query GetLoteProducciones($proyecto_id: ID!, $status: String, $first: Int = 15, $page: Int) {
        loteProducciones(proyecto_id: $proyecto_id, status: $status, first: $first, page: $page) {
            paginatorInfo {
                currentPage
                lastPage
                perPage
                total
                hasMorePages
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
                    etapas {
                        id
                        name
                        order
                    }
                }
                inputs {
                    id
                    inventory_item_id
                    quantity
                    cost
                    notes
                    product {
                        id
                        name
                        type
                        unit
                        current_stock
                    }
                }
                created_at
                updated_at
            }
        }
    }
`;

export const GET_LOTE_PRODUCCION = gql`
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
                inventory_item_id
                quantity
                cost
                notes
                product {
                    id
                    name
                    type
                    unit
                    current_stock
                }
            }
            created_at
            updated_at
        }
    }
`;

export const GET_TRANSACCIONES = gql`
    query GetTransacciones($proyecto_id: Int!, $status: String) {
        transacciones(proyecto_id: $proyecto_id, status: $status) {
            id
            proyecto_id
            cuenta_id
            categoria_id
            user_id
            monto
            titulo
            descripcion
            fecha
            notas
            status
            is_recurring
            recurrence_interval
            recurrence_day
            next_occurrence
            cuenta {
                id
                nombre
                tipo
                saldo_actual
                color
                icono
            }
            categoria {
                id
                nombre
                tipo
            }
            created_at
            updated_at
        }
    }
`;

export const GET_CUENTAS = gql`
    query GetCuentas($proyecto_id: Int!) {
        cuentas(proyecto_id: $proyecto_id) {
            id
            nombre
            banco
            tipo
            saldo_inicial
            saldo_actual
            estado
            moneda
            descripcion
            color
            icono
            tasa_interes_anual
            limite_credito
            transacciones {
                id
                monto
                titulo
                fecha
                status
            }
            created_at
            updated_at
        }
    }
`;

export const GET_CATEGORIAS = gql`
    query GetCategorias($proyecto_id: Int!) {
        categorias(proyecto_id: $proyecto_id) {
            id
            proyecto_id
            nombre
            tipo
            transacciones {
                id
                monto
                titulo
                fecha
            }
            created_at
            updated_at
        }
    }
`;
