import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import {
    GET_PRODUCTION_PROCESSES,
    GET_PRODUCTION_PROCESS,
    GET_LOTE_PRODUCCIONES,
    GET_LOTE_PRODUCCION,
    CREATE_PRODUCTION_PROCESS,
    UPDATE_PRODUCTION_PROCESS,
    DELETE_PRODUCTION_PROCESS,
    CREATE_LOTE,
    UPDATE_LOTE,
    UPDATE_LOTE_STAGE,
    FINISH_LOTE,
    DISCARD_LOTE,
    ADD_LOTE_INPUT,
    CONSUME_LOTE_INPUT,
} from '../../services/graphql';

export interface ProductionProcess {
    id: string;
    proyecto_id: string;
    name: string;
    description?: string;
    inventory_item_id?: string;
    etapas: {
        id: string;
        name: string;
        order: number;
    }[];
    created_at: string;
    updated_at: string;
}

export interface LoteProduccion {
    id: string;
    proyecto_id: string;
    production_process_id: string;
    stage_id: string;
    code: string;
    current_quantity: number;
    start_date: string;
    status: string;
    stage?: { id: string; name: string; order: number };
    productionProcess?: { 
        id: string; 
        name: string;
        etapas?: { id: string; name: string; order: number }[];
    };
    created_at: string;
    updated_at: string;
}

export function useProductionProcesses(proyectoId: string, first = 15, page = 1) {
    return useQuery<{ productionProcesses: { paginatorInfo: any; data: ProductionProcess[] } }>(
        GET_PRODUCTION_PROCESSES,
        { variables: { proyecto_id: proyectoId, first, page }, skip: !proyectoId }
    );
}

export function useProductionProcess(id: string) {
    return useQuery<{ productionProcess: ProductionProcess }>(GET_PRODUCTION_PROCESS, {
        variables: { id }, skip: !id
    });
}

export function useLoteProducciones(proyectoId: string, status?: string, first = 15, page = 1) {
    return useQuery<{ loteProducciones: { paginatorInfo: any; data: LoteProduccion[] } }>(
        GET_LOTE_PRODUCCIONES,
        { variables: { proyecto_id: proyectoId, status, first, page }, skip: !proyectoId }
    );
}

export function useLoteProduccion(id: string) {
    return useQuery<{ loteProduccion: LoteProduccion }>(GET_LOTE_PRODUCCION, {
        variables: { id }, skip: !id
    });
}

export function useCreateProductionProcess() {
    const client = useApolloClient();
    return useMutation(CREATE_PRODUCTION_PROCESS, {
        onCompleted: () => client.resetStore()
    });
}

export function useUpdateProductionProcess() {
    const client = useApolloClient();
    return useMutation(UPDATE_PRODUCTION_PROCESS, {
        onCompleted: () => client.resetStore()
    });
}

export function useDeleteProductionProcess() {
    const client = useApolloClient();
    return useMutation(DELETE_PRODUCTION_PROCESS, {
        onCompleted: () => client.resetStore()
    });
}

export function useCreateLote() {
    const client = useApolloClient();
    return useMutation(CREATE_LOTE, {
        onCompleted: () => client.resetStore()
    });
}

export function useUpdateLote() {
    const client = useApolloClient();
    return useMutation(UPDATE_LOTE, {
        onCompleted: () => client.resetStore()
    });
}

export function useUpdateLoteStage() {
    const client = useApolloClient();
    return useMutation(UPDATE_LOTE_STAGE, {
        onCompleted: () => client.resetStore()
    });
}

export function useFinishLote() {
    const client = useApolloClient();
    return useMutation(FINISH_LOTE, {
        onCompleted: () => client.resetStore()
    });
}

export function useDiscardLote() {
    const client = useApolloClient();
    return useMutation(DISCARD_LOTE, {
        onCompleted: () => client.resetStore()
    });
}

export function useAddLoteInput() {
    const client = useApolloClient();
    return useMutation(ADD_LOTE_INPUT, {
        onCompleted: () => client.resetStore()
    });
}

export function useConsumeLoteInput() {
    const client = useApolloClient();
    return useMutation(CONSUME_LOTE_INPUT, {
        onCompleted: () => client.resetStore()
    });
}
