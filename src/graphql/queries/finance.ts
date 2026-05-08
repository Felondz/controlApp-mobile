export const FINANCE_QUERIES = {
    GET_TRANSACCIONES: `
        query GetTransacciones($proyecto_id: ID!, $status: String) {
            transacciones(proyecto_id: $proyecto_id, status: $status) {
                id
                descripcion
                monto
                fecha
                status
                proyecto_id
                numero_factura
                fecha_emision
                fecha_vencimiento
                fecha_pago
                categoria {
                    id
                    nombre
                    tipo
                }
                cuenta {
                    id
                    nombre
                    icono
                }
            }
        }
    `,

    GET_CUENTAS: `
        query GetCuentas($proyecto_id: ID!) {
            cuentas(proyecto_id: $proyecto_id) {
                id
                nombre
                tipo
                saldo_inicial
                saldo_actual
                moneda
                color
                icono
                estado
                banco
                tasa_interes_anual
                limite_credito
            }
        }
    `,

    GET_CATEGORIAS: `
        query GetCategorias($proyecto_id: ID!) {
            categorias(proyecto_id: $proyecto_id) {
                id
                nombre
                tipo
            }
        }
    `,
};

export const FINANCE_MUTATIONS = {
    CREATE_TRANSACCION: `
        mutation CreateTransaccion(
            $proyecto_id: ID!
            $cuenta_id: ID!
            $categoria_id: ID!
            $monto: Float!
            $fecha: String!
            $titulo: String
            $descripcion: String
            $notas: String
            $status: String
            $cuenta_predeterminada_id: ID
            $debito_automatico: Boolean
            $is_recurring: Boolean
            $recurrence_day: Int
            $cuotas: Int
            $task_id: ID
            $numero_factura: String
            $fecha_emision: String
            $fecha_vencimiento: String
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
                numero_factura: $numero_factura
                fecha_emision: $fecha_emision
                fecha_vencimiento: $fecha_vencimiento
            ) {
                id
                titulo
                descripcion
                monto
                status
                numero_factura
                fecha_emision
                fecha_vencimiento
                fecha_pago
            }
        }
    `,

    UPDATE_TRANSACCION: `
        mutation UpdateTransaccion(
            $id: ID!
            $cuenta_id: ID
            $categoria_id: ID
            $monto: Float
            $fecha: String
            $titulo: String
            $descripcion: String
            $notas: String
            $status: String
            $numero_factura: String
            $fecha_emision: String
            $fecha_vencimiento: String
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
                numero_factura: $numero_factura
                fecha_emision: $fecha_emision
                fecha_vencimiento: $fecha_vencimiento
            ) {
                id
                titulo
                descripcion
                monto
                status
                numero_factura
                fecha_emision
                fecha_vencimiento
            }
        }
    `,

    CREATE_CUENTA: `
        mutation CreateCuenta(
            $proyecto_id: ID!
            $nombre: String!
            $tipo: String!
            $saldo_inicial: Int!
            $banco: String
            $moneda: String
            $dia_pago: Int
            $dia_corte: Int
            $limite_credito: Int
            $tasa_interes_anual: Float
            $descripcion: String
        ) {
            createCuenta(
                proyecto_id: $proyecto_id
                nombre: $nombre
                tipo: $tipo
                saldo_inicial: $saldo_inicial
                banco: $banco
                moneda: $moneda
                dia_pago: $dia_pago
                dia_corte: $dia_corte
                limite_credito: $limite_credito
                tasa_interes_anual: $tasa_interes_anual
                descripcion: $descripcion
            ) {
                id
                nombre
            }
        }
    `,

    PAY_CREDIT_CARD_BILL: `
        mutation PayCreditCard($proyecto_id: ID!, $cuenta_id: ID!, $cuenta_origen_id: ID!, $monto: Int!) {
            payCreditCardBill(
                proyecto_id: $proyecto_id
                cuenta_id: $cuenta_id
                cuenta_origen_id: $cuenta_origen_id
                monto: $monto
                tipo_pago: "total"
            ) {
                nuevo_saldo_tc
            }
        }
    `,

    PAY_TRANSACCION: `
        mutation PayBillDirectly($id: ID!) {
            payBillDirectly(id: $id) {
                id
                status
                fecha_pago
            }
        }
    `,

    DELETE_TRANSACCION: `
        mutation DeleteTransaccion($id: ID!) {
            deleteTransaccion(id: $id)
        }
    `,
};
