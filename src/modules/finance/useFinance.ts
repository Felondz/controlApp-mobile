import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import {
    GET_TRANSACCIONES,
    GET_CUENTAS,
    GET_CATEGORIAS,
    CREATE_TRANSACCION,
    UPDATE_TRANSACCION,
    DELETE_TRANSACCION,
    PAY_BILL_DIRECTLY,
    CREATE_CUENTA,
    UPDATE_CUENTA,
    DELETE_CUENTA,
    UPDATE_CUENTA_ESTADO,
    PAY_CREDIT_CARD_BILL,
    CREATE_CATEGORIA,
    UPDATE_CATEGORIA,
    DELETE_CATEGORIA,
} from '../../services/graphql';

export interface Cuenta {
    id: string;
    proyecto_id?: number;
    nombre: string;
    tipo: string;
    moneda: string;
    saldo_inicial: number;
    saldo_actual: number;
    estado: string;
}

export interface Categoria {
    id: string;
    proyecto_id: number;
    nombre: string;
    tipo: string;
}

export interface Transaccion {
    id: string;
    proyecto_id: number;
    cuenta_id?: number;
    categoria_id: number;
    monto: number;
    titulo?: string;
    fecha: string;
    status: string;
    cuenta?: Cuenta;
    categoria?: Categoria;
}

export function useTransacciones(proyectoId: number, status?: string) {
    return useQuery<{ transacciones: Transaccion[] }>(GET_TRANSACCIONES, {
        variables: { proyecto_id: proyectoId, status },
        skip: !proyectoId
    });
}

export function useTransaccion(id: string) {
    return useQuery<{ transaccion: Transaccion }>(GET_TRANSACCIONES, {
        variables: { id },
        skip: !id
    });
}

export function useCuentas(proyectoId: number) {
    return useQuery<{ cuentas: Cuenta[] }>(GET_CUENTAS, {
        variables: { proyecto_id: proyectoId },
        skip: !proyectoId
    });
}

export function useCategorias(proyectoId: number) {
    return useQuery<{ categorias: Categoria[] }>(GET_CATEGORIAS, {
        variables: { proyecto_id: proyectoId },
        skip: !proyectoId
    });
}

export function useCreateTransaccion() {
    const client = useApolloClient();
    return useMutation(CREATE_TRANSACCION, {
        onCompleted: () => client.resetStore()
    });
}

export function useUpdateTransaccion() {
    const client = useApolloClient();
    return useMutation(UPDATE_TRANSACCION, {
        onCompleted: () => client.resetStore()
    });
}

export function useDeleteTransaccion() {
    const client = useApolloClient();
    return useMutation(DELETE_TRANSACCION, {
        onCompleted: () => client.resetStore()
    });
}

export function usePayBillDirectly() {
    const client = useApolloClient();
    return useMutation(PAY_BILL_DIRECTLY, {
        onCompleted: () => client.resetStore()
    });
}

export function useCreateCuenta() {
    const client = useApolloClient();
    return useMutation(CREATE_CUENTA, {
        onCompleted: () => client.resetStore()
    });
}

export function useUpdateCuenta() {
    const client = useApolloClient();
    return useMutation(UPDATE_CUENTA, {
        onCompleted: () => client.resetStore()
    });
}

export function useDeleteCuenta() {
    const client = useApolloClient();
    return useMutation(DELETE_CUENTA, {
        onCompleted: () => client.resetStore()
    });
}

export function useUpdateCuentaEstado() {
    const client = useApolloClient();
    return useMutation(UPDATE_CUENTA_ESTADO, {
        onCompleted: () => client.resetStore()
    });
}

export function usePayCreditCardBill() {
    const client = useApolloClient();
    return useMutation(PAY_CREDIT_CARD_BILL, {
        onCompleted: () => client.resetStore()
    });
}

export function useCreateCategoria() {
    const client = useApolloClient();
    return useMutation(CREATE_CATEGORIA, {
        onCompleted: () => client.resetStore()
    });
}

export function useUpdateCategoria() {
    const client = useApolloClient();
    return useMutation(UPDATE_CATEGORIA, {
        onCompleted: () => client.resetStore()
    });
}

export function useDeleteCategoria() {
    const client = useApolloClient();
    return useMutation(DELETE_CATEGORIA, {
        onCompleted: () => client.resetStore()
    });
}
