import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGraphQLClient } from '../../graphql/client';
import { FINANCE_QUERIES, FINANCE_MUTATIONS } from '../../graphql/queries/finance';

export interface Cuenta {
    id: string;
    nombre: string;
    banco?: string;
    tipo: string;
    saldo_inicial: number;
    saldo_actual: number;
    estado: string;
    moneda?: string;
    descripcion?: string;
    color?: string;
    icono?: string;
    tasa_interes_anual?: number;
    limite_credito?: number;
    transacciones?: Transaccion[];
    created_at: string;
    updated_at: string;
}

export interface Categoria {
    id: string;
    proyecto_id: number;
    nombre: string;
    tipo: string;
    transacciones?: Transaccion[];
    created_at: string;
    updated_at: string;
}

export interface Transaccion {
    id: string;
    proyecto_id: number;
    cuenta_id?: number;
    categoria_id: number;
    user_id: number;
    monto: number;
    titulo?: string;
    descripcion?: string;
    fecha: string;
    notas?: string;
    status: string;
    is_recurring?: boolean;
    recurrence_interval?: string;
    recurrence_day?: number;
    next_occurrence?: string;
    cuenta?: Cuenta;
    categoria?: Categoria;
    created_at: string;
    updated_at: string;
}

interface TransaccionesResponse {
    transacciones: Transaccion[];
}

interface CuentasResponse {
    cuentas: Cuenta[];
}

interface CategoriasResponse {
    categorias: Categoria[];
}

export const useTransacciones = (
    proyectoId: number,
    options?: { status?: string }
) => {
    return useQuery({
        queryKey: ['transacciones', proyectoId, options],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<TransaccionesResponse>(
                FINANCE_QUERIES.GET_TRANSACCIONES,
                { proyecto_id: proyectoId, ...options }
            );
            return response.transacciones;
        },
        enabled: !!proyectoId,
    });
};

export const useCuentas = (proyectoId: number) => {
    return useQuery({
        queryKey: ['cuentas', proyectoId],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<CuentasResponse>(
                FINANCE_QUERIES.GET_CUENTAS,
                { proyecto_id: proyectoId }
            );
            return response.cuentas;
        },
        enabled: !!proyectoId,
    });
};

export const useCategorias = (proyectoId: number) => {
    return useQuery({
        queryKey: ['categorias', proyectoId],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<CategoriasResponse>(
                FINANCE_QUERIES.GET_CATEGORIAS,
                { proyecto_id: proyectoId }
            );
            return response.categorias;
        },
        enabled: !!proyectoId,
    });
};

export const useCreateTransaccion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            proyecto_id: number;
            cuenta_id: number;
            categoria_id: number;
            monto: number;
            fecha: string;
            titulo?: string;
            descripcion?: string;
            notas?: string;
            status?: string;
            is_recurring?: boolean;
            recurrence_day?: number;
            cuotas?: number;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ createTransaccion: Transaccion }>(
                FINANCE_MUTATIONS.CREATE_TRANSACCION,
                input
            );
            return response.createTransaccion;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transacciones', variables.proyecto_id] });
            queryClient.invalidateQueries({ queryKey: ['cuentas', variables.proyecto_id] });
        },
    });
};

export const useUpdateTransaccion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...input
        }: {
            id: string;
            cuenta_id?: number;
            categoria_id?: number;
            monto?: number;
            fecha?: string;
            titulo?: string;
            descripcion?: string;
            notas?: string;
            status?: string;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ updateTransaccion: Transaccion }>(
                FINANCE_MUTATIONS.UPDATE_TRANSACCION,
                { id, ...input }
            );
            return response.updateTransaccion;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transacciones'] });
            queryClient.invalidateQueries({ queryKey: ['cuentas'] });
        },
    });
};

export const useDeleteTransaccion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, proyecto_id }: { id: string; proyecto_id: number }) => {
            const client = await getGraphQLClient();
            await client.request(FINANCE_MUTATIONS.DELETE_TRANSACCION, { id });
            return { id, proyecto_id };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['transacciones', data.proyecto_id] });
            queryClient.invalidateQueries({ queryKey: ['cuentas', data.proyecto_id] });
        },
    });
};

export const usePayBillDirectly = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, proyecto_id }: { id: string; proyecto_id: number }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ payBillDirectly: Transaccion }>(
                FINANCE_MUTATIONS.PAY_BILL_DIRECTLY,
                { id }
            );
            return { transaccion: response.payBillDirectly, proyecto_id };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['transacciones', data.proyecto_id] });
            queryClient.invalidateQueries({ queryKey: ['cuentas', data.proyecto_id] });
        },
    });
};

export const useCreateCuenta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            proyecto_id: number;
            nombre: string;
            tipo: string;
            saldo_inicial: number;
            banco?: string;
            moneda?: string;
            descripcion?: string;
            color?: string;
            icono?: string;
            tasa_interes_anual?: number;
            limite_credito?: number;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ createCuenta: Cuenta }>(
                FINANCE_MUTATIONS.CREATE_CUENTA,
                input
            );
            return response.createCuenta;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cuentas', variables.proyecto_id] });
        },
    });
};

export const useDeleteCuenta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, proyecto_id }: { id: string; proyecto_id: number }) => {
            const client = await getGraphQLClient();
            await client.request(FINANCE_MUTATIONS.DELETE_CUENTA, { id, proyecto_id });
            return { id, proyecto_id };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cuentas', data.proyecto_id] });
        },
    });
};
