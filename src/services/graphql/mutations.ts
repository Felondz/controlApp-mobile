import { gql } from '@apollo/client';

export const CREATE_INVENTORY_ITEM = gql`
    mutation CreateInventoryItem(
        $proyecto_id: ID!
        $name: String!
        $type: String!
        $unit: String!
        $sku: String
        $min_stock_level: Float
        $initial_quantity: Float
        $initial_cost: Float
        $sale_price: Float
    ) {
        createInventoryItem(
            proyecto_id: $proyecto_id
            name: $name
            type: $type
            unit: $unit
            sku: $sku
            min_stock_level: $min_stock_level
            initial_quantity: $initial_quantity
            initial_cost: $initial_cost
            sale_price: $sale_price
        ) {
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

export const UPDATE_INVENTORY_ITEM = gql`
    mutation UpdateInventoryItem(
        $id: ID!
        $proyecto_id: ID!
        $name: String!
        $type: String!
        $unit: String!
        $sku: String
        $min_stock_level: Float
        $sale_price: Float
        $stock_adjustment: Float
    ) {
        updateInventoryItem(
            id: $id
            proyecto_id: $proyecto_id
            name: $name
            type: $type
            unit: $unit
            sku: $sku
            min_stock_level: $min_stock_level
            sale_price: $sale_price
            stock_adjustment: $stock_adjustment
        ) {
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

export const DELETE_INVENTORY_ITEM = gql`
    mutation DeleteInventoryItem($id: ID!, $proyecto_id: ID!) {
        deleteInventoryItem(id: $id, proyecto_id: $proyecto_id)
    }
`;

export const CREATE_PRODUCTION_PROCESS = gql`
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
            etapas {
                id
                name
                order
            }
            created_at
            updated_at
        }
    }
`;

export const UPDATE_PRODUCTION_PROCESS = gql`
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
            created_at
            updated_at
        }
    }
`;

export const DELETE_PRODUCTION_PROCESS = gql`
    mutation DeleteProductionProcess($id: ID!, $proyecto_id: ID!) {
        deleteProductionProcess(id: $id, proyecto_id: $proyecto_id)
    }
`;

export const CREATE_LOTE = gql`
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
            stage_id
            code
            initial_quantity
            current_quantity
            start_date
            assigned_to
            notes
            status
            stage {
                id
                name
                order
            }
            productionProcess {
                id
                name
            }
            created_at
            updated_at
        }
    }
`;

export const UPDATE_LOTE = gql`
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
            proyecto_id
            start_date
            assigned_to
            notes
            updated_at
        }
    }
`;

export const UPDATE_LOTE_STAGE = gql`
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
            current_quantity
            status
            stage {
                id
                name
                order
            }
            updated_at
        }
    }
`;

export const FINISH_LOTE = gql`
    mutation FinishLote($id: ID!, $proyecto_id: ID!, $final_quantity: Float!) {
        finishLote(id: $id, proyecto_id: $proyecto_id, final_quantity: $final_quantity) {
            id
            current_quantity
            end_date
            status
            updated_at
        }
    }
`;

export const DISCARD_LOTE = gql`
    mutation DiscardLote($id: ID!, $proyecto_id: ID!, $reason: String!) {
        discardLote(id: $id, proyecto_id: $proyecto_id, reason: $reason) {
            id
            status
            notes
            end_date
            updated_at
        }
    }
`;

export const ADD_LOTE_INPUT = gql`
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
            lote_produccion_id
            inventory_item_id
            quantity
            cost
            notes
            product {
                id
                name
                type
                cost_price
            }
            created_at
        }
    }
`;

export const CONSUME_LOTE_INPUT = gql`
    mutation ConsumeLoteInput($input_id: ID!, $proyecto_id: ID!, $quantity: Float!) {
        consumeLoteInput(input_id: $input_id, proyecto_id: $proyecto_id, quantity: $quantity) {
            id
            quantity
            updated_at
        }
    }
`;

export const CREATE_TRANSACCION = gql`
    mutation CreateTransaccion(
        $proyecto_id: Int!
        $cuenta_id: Int!
        $categoria_id: Int!
        $monto: Float!
        $fecha: String!
        $titulo: String
        $descripcion: String
        $notas: String
        $status: String
        $cuenta_predeterminada_id: Int
        $debito_automatico: Boolean
        $is_recurring: Boolean
        $recurrence_day: Int
        $cuotas: Int
        $task_id: Int
    ) {
        createTransaccion(
            proyecto_id: $proyecto_id
            cuenta_id: $cuenta_id
            categoria_id: $categoria_id
            monto: $monto
            fecha: $fecha
            titulo: $titulo
            descripcion: $descripcion
            notas: $notas
            status: $status
            cuenta_predeterminada_id: $cuenta_predeterminada_id
            debito_automatico: $debito_automatico
            is_recurring: $is_recurring
            recurrence_day: $recurrence_day
            cuotas: $cuotas
            task_id: $task_id
        ) {
            id
            proyecto_id
            cuenta_id
            categoria_id
            monto
            titulo
            descripcion
            fecha
            notas
            status
            is_recurring
            recurrence_interval
            recurrence_day
            cuenta {
                id
                nombre
                saldo_actual
            }
            categoria {
                id
                nombre
            }
            created_at
            updated_at
        }
    }
`;

export const UPDATE_TRANSACCION = gql`
    mutation UpdateTransaccion(
        $id: ID!
        $cuenta_id: Int
        $categoria_id: Int
        $monto: Float
        $fecha: String
        $titulo: String
        $descripcion: String
        $notas: String
        $status: String
    ) {
        updateTransaccion(
            id: $id
            cuenta_id: $cuenta_id
            categoria_id: $categoria_id
            monto: $monto
            fecha: $fecha
            titulo: $titulo
            descripcion: $descripcion
            notas: $notas
            status: $status
        ) {
            id
            cuenta_id
            categoria_id
            monto
            titulo
            descripcion
            fecha
            notas
            status
            updated_at
        }
    }
`;

export const DELETE_TRANSACCION = gql`
    mutation DeleteTransaccion($id: ID!) {
        deleteTransaccion(id: $id)
    }
`;

export const PAY_BILL_DIRECTLY = gql`
    mutation PayBillDirectly($id: ID!) {
        payBillDirectly(id: $id) {
            id
            status
            updated_at
        }
    }
`;

export const CREATE_CUENTA = gql`
    mutation CreateCuenta(
        $proyecto_id: Int!
        $nombre: String!
        $tipo: String!
        $saldo_inicial: Int!
        $banco: String
        $moneda: String
        $descripcion: String
        $color: String
        $icono: String
        $tasa_interes_anual: Float
        $limite_credito: Int
        $monto_desembolsado: Int
        $cuenta_destino_id: Int
    ) {
        createCuenta(
            proyecto_id: $proyecto_id
            nombre: $nombre
            tipo: $tipo
            saldo_inicial: $saldo_inicial
            banco: $banco
            moneda: $moneda
            descripcion: $descripcion
            color: $color
            icono: $icono
            tasa_interes_anual: $tasa_interes_anual
            limite_credito: $limite_credito
            monto_desembolsado: $monto_desembolsado
            cuenta_destino_id: $cuenta_destino_id
        ) {
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
            created_at
            updated_at
        }
    }
`;

export const UPDATE_CUENTA = gql`
    mutation UpdateCuenta(
        $id: ID!
        $proyecto_id: Int!
        $nombre: String
        $banco: String
        $descripcion: String
        $saldo_inicial: Int
        $color: String
        $icono: String
    ) {
        updateCuenta(
            id: $id
            proyecto_id: $proyecto_id
            nombre: $nombre
            banco: $banco
            descripcion: $descripcion
            saldo_inicial: $saldo_inicial
            color: $color
            icono: $icono
        ) {
            id
            nombre
            banco
            descripcion
            saldo_inicial
            saldo_actual
            color
            icono
            updated_at
        }
    }
`;

export const DELETE_CUENTA = gql`
    mutation DeleteCuenta($id: ID!, $proyecto_id: Int!) {
        deleteCuenta(id: $id, proyecto_id: $proyecto_id)
    }
`;

export const UPDATE_CUENTA_ESTADO = gql`
    mutation UpdateCuentaEstado($id: ID!, $proyecto_id: Int!, $estado: String!) {
        updateCuentaEstado(id: $id, proyecto_id: $proyecto_id, estado: $estado) {
            id
            estado
            updated_at
        }
    }
`;

export const PAY_CREDIT_CARD_BILL = gql`
    mutation PayCreditCardBill(
        $proyecto_id: Int!
        $cuenta_id: Int!
        $cuenta_origen_id: Int!
        $monto: Int!
        $tipo_pago: String!
    ) {
        payCreditCardBill(
            proyecto_id: $proyecto_id
            cuenta_id: $cuenta_id
            cuenta_origen_id: $cuenta_origen_id
            monto: $monto
            tipo_pago: $tipo_pago
        ) {
            transaccion {
                id
                monto
                status
            }
            nuevo_saldo_origen
            nuevo_saldo_tc
        }
    }
`;

export const CREATE_CATEGORIA = gql`
    mutation CreateCategoria($proyecto_id: Int!, $nombre: String!, $tipo: String!) {
        createCategoria(proyecto_id: $proyecto_id, nombre: $nombre, tipo: $tipo) {
            id
            proyecto_id
            nombre
            tipo
            created_at
            updated_at
        }
    }
`;

export const UPDATE_CATEGORIA = gql`
    mutation UpdateCategoria($id: ID!, $nombre: String!, $tipo: String!) {
        updateCategoria(id: $id, nombre: $nombre, tipo: $tipo) {
            id
            nombre
            tipo
            updated_at
        }
    }
`;

export const DELETE_CATEGORIA = gql`
    mutation DeleteCategoria($id: ID!) {
        deleteCategoria(id: $id)
    }
`;

export const COMPLETE_TOUR = gql`
    mutation CompleteTour($tour: String!) {
        completeTour(tour: $tour) {
            id
            settings {
                completed_tours
            }
        }
    }
`;
