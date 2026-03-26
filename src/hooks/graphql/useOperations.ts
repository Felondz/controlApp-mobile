import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGraphQLClient } from '../../graphql/client';
import { OPERATIONS_QUERIES, OPERATIONS_MUTATIONS } from '../../graphql/queries/operations';

export interface OpInventoryItem {
    id: string;
    name: string;
    type: string;
    unit: string;
    current_stock?: number;
}

export interface StageInputTemplate {
    id: string;
    etapa_proceso_id: string;
    inventory_item_id: string;
    quantity: number;
    item?: OpInventoryItem;
}

export interface EtapaProceso {
    id: string;
    production_process_id: string;
    name: string;
    description?: string;
    order: number;
    inputTemplates: StageInputTemplate[];
    created_at: string;
    updated_at: string;
}

export interface ProductionProcess {
    id: string;
    proyecto_id: string;
    name: string;
    description?: string;
    inventory_item_id?: string;
    outputProduct?: OpInventoryItem;
    etapas: EtapaProceso[];
    lotes?: LoteProduccion[];
    created_at: string;
    updated_at: string;
}

export interface LoteInsumo {
    id: string;
    lote_produccion_id: string;
    inventory_item_id: string;
    quantity: number;
    cost: number;
    notes?: string;
    product?: OpInventoryItem;
    created_at: string;
    updated_at: string;
}

export interface LoteProduccion {
    id: string;
    proyecto_id: string;
    production_process_id: string;
    stage_id: string;
    inventory_item_id?: string;
    code: string;
    initial_quantity?: number;
    current_quantity: number;
    start_date: string;
    end_date?: string;
    assigned_to?: string;
    notes?: string;
    status: string;
    stage?: EtapaProceso;
    productionProcess?: ProductionProcess;
    inputs: LoteInsumo[];
    created_at: string;
    updated_at: string;
}

interface PaginatorInfo {
    count: number;
    currentPage: number;
    firstItem: number;
    hasMorePages: boolean;
    lastItem: number;
    lastPage: number;
    perPage: number;
    total: number;
}

interface ProductionProcessesResponse {
    productionProcesses: {
        paginatorInfo: PaginatorInfo;
        data: ProductionProcess[];
    };
}

interface ProductionProcessResponse {
    productionProcess: ProductionProcess;
}

interface LoteProduccionesResponse {
    loteProducciones: {
        paginatorInfo: PaginatorInfo;
        data: LoteProduccion[];
    };
}

interface LoteProduccionResponse {
    loteProduccion: LoteProduccion;
}

export const useProductionProcesses = (
    proyectoId: string,
    options?: { first?: number; page?: number }
) => {
    return useQuery({
        queryKey: ['production-processes', proyectoId, options],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<ProductionProcessesResponse>(
                OPERATIONS_QUERIES.GET_PRODUCTION_PROCESSES,
                { proyecto_id: proyectoId, ...options }
            );
            return response.productionProcesses;
        },
        enabled: !!proyectoId,
    });
};

export const useProductionProcess = (id: string) => {
    return useQuery({
        queryKey: ['production-process', id],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<ProductionProcessResponse>(
                OPERATIONS_QUERIES.GET_PRODUCTION_PROCESS,
                { id }
            );
            return response.productionProcess;
        },
        enabled: !!id,
    });
};

export const useLoteProducciones = (
    proyectoId: string,
    options?: { first?: number; page?: number; status?: string }
) => {
    return useQuery({
        queryKey: ['lote-producciones', proyectoId, options],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<LoteProduccionesResponse>(
                OPERATIONS_QUERIES.GET_LOTE_PRODUCCIONES,
                { proyecto_id: proyectoId, ...options }
            );
            return response.loteProducciones;
        },
        enabled: !!proyectoId,
    });
};

export const useLoteProduccion = (id: string) => {
    return useQuery({
        queryKey: ['lote-produccion', id],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<LoteProduccionResponse>(
                OPERATIONS_QUERIES.GET_LOTE_PRODUCCION,
                { id }
            );
            return response.loteProduccion;
        },
        enabled: !!id,
    });
};

export const useCreateProductionProcess = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            proyecto_id: string;
            name: string;
            description?: string;
            inventory_item_id?: string;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ createProductionProcess: ProductionProcess }>(
                OPERATIONS_MUTATIONS.CREATE_PRODUCTION_PROCESS,
                input
            );
            return response.createProductionProcess;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['production-processes', variables.proyecto_id] });
        },
    });
};

export const useDeleteProductionProcess = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, proyecto_id }: { id: string; proyecto_id: string }) => {
            const client = await getGraphQLClient();
            await client.request(OPERATIONS_MUTATIONS.DELETE_PRODUCTION_PROCESS, { id, proyecto_id });
            return { id, proyecto_id };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['production-processes', data.proyecto_id] });
        },
    });
};

export const useCreateLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            proyecto_id: string;
            production_process_id: string;
            start_date: string;
            assigned_to?: string;
            notes?: string;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ createLote: LoteProduccion }>(
                OPERATIONS_MUTATIONS.CREATE_LOTE,
                input
            );
            return response.createLote;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lote-producciones', variables.proyecto_id] });
        },
    });
};

export const useUpdateLoteStage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            id: string;
            proyecto_id: string;
            stage_id: string;
            waste_quantity?: number;
            notes?: string;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ updateLoteStage: LoteProduccion }>(
                OPERATIONS_MUTATIONS.UPDATE_LOTE_STAGE,
                input
            );
            return response.updateLoteStage;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lote-producciones', variables.proyecto_id] });
            queryClient.invalidateQueries({ queryKey: ['lote-produccion', variables.id] });
        },
    });
};

export const useFinishLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            id: string;
            proyecto_id: string;
            final_quantity: number;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ finishLote: LoteProduccion }>(
                OPERATIONS_MUTATIONS.FINISH_LOTE,
                input
            );
            return response.finishLote;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lote-producciones', variables.proyecto_id] });
            queryClient.invalidateQueries({ queryKey: ['lote-produccion', variables.id] });
        },
    });
};

export const useDiscardLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            id: string;
            proyecto_id: string;
            reason: string;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ discardLote: LoteProduccion }>(
                OPERATIONS_MUTATIONS.DISCARD_LOTE,
                input
            );
            return response.discardLote;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lote-producciones', variables.proyecto_id] });
            queryClient.invalidateQueries({ queryKey: ['lote-produccion', variables.id] });
        },
    });
};

export const useAddLoteInput = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            id: string;
            proyecto_id: string;
            inventory_item_id: string;
            quantity: number;
            notes?: string;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ addLoteInput: LoteInsumo }>(
                OPERATIONS_MUTATIONS.ADD_LOTE_INPUT,
                input
            );
            return response.addLoteInput;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lote-produccion', variables.id] });
        },
    });
};

export const useConsumeLoteInput = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            input_id: string;
            proyecto_id: string;
            quantity: number;
        }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ consumeLoteInput: LoteInsumo }>(
                OPERATIONS_MUTATIONS.CONSUME_LOTE_INPUT,
                input
            );
            return response.consumeLoteInput;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lote-produccion', variables.input_id] });
        },
    });
};
