import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGraphQLClient } from '../../graphql/client';
import { FINANCE_QUERIES, FINANCE_MUTATIONS } from '../../graphql/queries/finance';

export interface Cuenta {
    id: string;
    nombre: string;
    tipo: string;
    saldo: number;
    saldo_inicial?: number;
    saldo_actual?: number;
    banco?: string;
    moneda: string;
    color?: string;
    icono?: string;
    estado: string;
    dia_pago?: number;
    dia_corte?: number;
    limite_credito?: number;
    tasa_interes_anual?: number;
    descripcion?: string;
    created_at: string;
}

export interface Categoria {
    id: string;
    nombre: string;
    tipo: string;
    created_at: string;
}

export interface Transaccion {
    id: string;
    proyecto_id: string;
    cuenta_id?: string;
    categoria_id: string;
    user_id: string;
    monto: number;
    descripcion?: string;
    fecha: string;
    notas?: string;
    status: string;
    is_recurring?: boolean;
    recurrence_interval?: string;
    recurrence_day?: number;
    next_occurrence?: string;
    numero_factura?: string;
    fecha_emision?: string;
    fecha_vencimiento?: string;
    fecha_pago?: string;
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
    proyectoId: string,
    options?: { status?: string }
) => {
    return useQuery({
        queryKey: ['transacciones', proyectoId.toString(), options],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<TransaccionesResponse>(
                FINANCE_QUERIES.GET_TRANSACCIONES,
                { proyecto_id: proyectoId, ...options }
            );
            return response.transacciones || [];
        },
        enabled: !!proyectoId,
    });
};

export const useTransaccion = (id: string) => {
    return useQuery({
        queryKey: ['transaccion', id],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<{ transaccion: Transaccion }>(
                FINANCE_QUERIES.GET_TRANSACCION,
                { id }
            );
            return response.transaccion;
        },
        enabled: !!id,
    });
};

export const useCuentas = (proyectoId: string) => {
    return useQuery({
        queryKey: ['cuentas', proyectoId.toString()],
        queryFn: async () => {
            console.log(`[useCuentas] Fetching accounts for project: ${proyectoId}`);
            const client = await getGraphQLClient();
            const response = await client.request<CuentasResponse>(
                FINANCE_QUERIES.GET_CUENTAS,
                { proyecto_id: proyectoId }
            );
            console.log(`[useCuentas] Backend Response:`, JSON.stringify(response, null, 2));
            return response.cuentas || [];
        },
        enabled: !!proyectoId,
    });
};

export const useCategorias = (proyectoId: string) => {
    return useQuery({
        queryKey: ['categorias', proyectoId.toString()],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<CategoriasResponse>(
                FINANCE_QUERIES.GET_CATEGORIAS,
                { proyecto_id: proyectoId }
            );
            return response.categorias || [];
        },
        enabled: !!proyectoId,
    });
};

export const useCreateTransaccion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            proyecto_id: string;
            cuenta_id: string;
            categoria_id: string;
            monto: number;
            fecha: string;
            descripcion?: string;
            notas?: string;
            status?: string;
            is_recurring?: boolean;
            recurrence_day?: number;
            numero_factura?: string;
            fecha_emision?: string;
            fecha_vencimiento?: string;
            cuenta_predeterminada_id?: string;
            debito_automatico?: boolean;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ createTransaccion: Transaccion }>(
                FINANCE_MUTATIONS.CREATE_TRANSACCION,
                input
            );
            return response.createTransaccion;
        },
        onSuccess: async (_, variables) => {
            console.log(`[useCreateTransaccion] Success! Invalidating queries for project: ${variables.proyecto_id}`);
            await queryClient.invalidateQueries({ 
                queryKey: ['cuentas', variables.proyecto_id.toString()] 
            });
            await queryClient.invalidateQueries({ 
                queryKey: ['transacciones', variables.proyecto_id.toString()] 
            });
        },
    });
};

export const usePayTransaccion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, proyecto_id }: { id: string, proyecto_id: string }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ payBillDirectly: Transaccion }>(
                FINANCE_MUTATIONS.PAY_TRANSACCION,
                { id }
            );
            return response.payBillDirectly;
        },
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['cuentas', variables.proyecto_id.toString()] });
            await queryClient.invalidateQueries({ queryKey: ['transacciones', variables.proyecto_id.toString()] });
        },
    });
};

export const useUpdateTransaccion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...input }: { id: string } & Partial<Transaccion>) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ updateTransaccion: Transaccion }>(
                FINANCE_MUTATIONS.UPDATE_TRANSACCION,
                { id, ...input }
            );
            return response.updateTransaccion;
        },
        onSuccess: async (data) => {
            if (data?.proyecto_id) {
                await queryClient.invalidateQueries({ queryKey: ['cuentas', data.proyecto_id.toString()] });
                await queryClient.invalidateQueries({ queryKey: ['transacciones', data.proyecto_id.toString()] });
            }
        },
    });
};

export const useDeleteTransaccion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, proyecto_id }: { id: string, proyecto_id: string }) => {
            const client = await getGraphQLClient();
            await client.request(
                FINANCE_MUTATIONS.DELETE_TRANSACCION,
                { id }
            );
            return { id, proyecto_id };
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['cuentas', data.proyecto_id.toString()] });
            await queryClient.invalidateQueries({ queryKey: ['transacciones', data.proyecto_id.toString()] });
        },
    });
};

export const useCreateCuenta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            proyecto_id: string;
            nombre: string;
            tipo: string;
            saldo_inicial: number;
            banco?: string;
            moneda?: string;
            dia_pago?: number;
            dia_corte?: number;
            limite_credito?: number;
            tasa_interes_anual?: number;
            descripcion?: string;
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

export const useUpdateCuenta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...input }: { id: string } & Partial<Cuenta>) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ updateCuenta: Cuenta }>(
                FINANCE_MUTATIONS.UPDATE_CUENTA,
                { id, ...input }
            );
            return response.updateCuenta;
        },
        onSuccess: (_, variables) => {
            // Need proyecto_id to invalidate
        },
    });
};

export const useDeleteCuenta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, proyecto_id }: { id: string; proyecto_id: string }) => {
            const client = await getGraphQLClient();
            await client.request(
                FINANCE_MUTATIONS.DELETE_CUENTA,
                { id, proyecto_id }
            );
            return id;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cuentas', variables.proyecto_id] });
        },
    });
};
