export const FINANCE_QUERIES = {
    GET_TRANSACCIONES: `
        query GetTransacciones($proyecto_id: ID!, $status: String) {
            transacciones(proyecto_id: $proyecto_id, status: $status) {
                id
                descripcion
                monto
                fecha
                status
                descripcion
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
                saldo_actual
                moneda
                color
                icono
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
            $descripcion: String
            $notas: String
            $status: String
            $cuenta_predeterminada_id: ID
            $debito_automatico: Boolean
            $is_recurring: Boolean
            $recurrence_day: Int
            $cuotas: Int
            $task_id: ID
        ) {
            createTransaccion(
                proyecto_id: $proyecto_id
                cuenta_id: $cuenta_id
                categoria_id: $categoria_id
                monto: $monto
                fecha: $fecha
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
                descripcion
                monto
                status
            }
        }
    `,

    CREATE_CUENTA: `
        mutation CreateCuenta($proyecto_id: ID!, $nombre: String!, $tipo: String!, $saldo_inicial: Int!) {
            createCuenta(
                proyecto_id: $proyecto_id
                nombre: $nombre
                tipo: $tipo
                saldo_inicial: $saldo_inicial
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
};
