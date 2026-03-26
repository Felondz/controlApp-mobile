export const FINANCE_QUERIES = {
    GET_TRANSACCIONES: `
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
    `,

    GET_CUENTAS: `
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
                    fecha
                }
                created_at
                updated_at
            }
        }
    `,

    GET_CATEGORIAS: `
        query GetCategorias($proyecto_id: Int!) {
            categorias(proyecto_id: $proyecto_id) {
                id
                proyecto_id
                nombre
                tipo
                transacciones {
                    id
                    monto
                }
                created_at
                updated_at
            }
        }
    `,
};

export const FINANCE_MUTATIONS = {
    CREATE_TRANSACCION: `
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
                cuenta {
                    id
                    nombre
                }
                categoria {
                    id
                    nombre
                }
                created_at
            }
        }
    `,

    UPDATE_TRANSACCION: `
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
    `,

    DELETE_TRANSACCION: `
        mutation DeleteTransaccion($id: ID!) {
            deleteTransaccion(id: $id)
        }
    `,

    PAY_BILL_DIRECTLY: `
        mutation PayBillDirectly($id: ID!) {
            payBillDirectly(id: $id) {
                id
                status
                cuenta_id
                updated_at
            }
        }
    `,

    CREATE_CUENTA: `
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
                tipo
                saldo_inicial
                saldo_actual
                estado
                moneda
                color
                icono
            }
        }
    `,

    UPDATE_CUENTA: `
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
                color
                icono
                updated_at
            }
        }
    `,

    DELETE_CUENTA: `
        mutation DeleteCuenta($id: ID!, $proyecto_id: Int!) {
            deleteCuenta(id: $id, proyecto_id: $proyecto_id)
        }
    `,

    UPDATE_CUENTA_ESTADO: `
        mutation UpdateCuentaEstado($id: ID!, $proyecto_id: Int!, $estado: String!) {
            updateCuentaEstado(id: $id, proyecto_id: $proyecto_id, estado: $estado) {
                id
                estado
            }
        }
    `,

    PAY_CREDIT_CARD_BILL: `
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
    `,

    CREATE_CATEGORIA: `
        mutation CreateCategoria(
            $proyecto_id: Int!
            $nombre: String!
            $tipo: String!
        ) {
            createCategoria(
                proyecto_id: $proyecto_id
                nombre: $nombre
                tipo: $tipo
            ) {
                id
                proyecto_id
                nombre
                tipo
            }
        }
    `,

    UPDATE_CATEGORIA: `
        mutation UpdateCategoria(
            $id: ID!
            $nombre: String!
            $tipo: String!
        ) {
            updateCategoria(
                id: $id
                nombre: $nombre
                tipo: $tipo
            ) {
                id
                nombre
                tipo
            }
        }
    `,

    DELETE_CATEGORIA: `
        mutation DeleteCategoria($id: ID!) {
            deleteCategoria(id: $id)
        }
    `,
};
