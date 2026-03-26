import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGraphQLClient } from '../../graphql/client';
import { INVENTORY_QUERIES, INVENTORY_MUTATIONS } from '../../graphql/queries/inventory';

export interface InventoryItem {
    id: string;
    proyecto_id: string;
    name: string;
    sku?: string;
    type: string;
    unit: string;
    current_stock: number;
    min_stock_level: number;
    cost_price: number;
    sale_price: number;
    image_path?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface InventoryItemInput {
    proyecto_id: string;
    name: string;
    type: string;
    unit: string;
    sku?: string;
    min_stock_level?: number;
    initial_quantity?: number;
    initial_cost?: number;
    sale_price?: number;
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

interface InventoryItemsResponse {
    inventoryItems: {
        paginatorInfo: PaginatorInfo;
        data: InventoryItem[];
    };
}

interface InventoryItemResponse {
    inventoryItem: InventoryItem;
}

export const useInventoryItems = (
    proyectoId: string,
    options?: {
        first?: number;
        page?: number;
        name?: string;
        type?: string;
        is_active?: boolean;
    }
) => {
    return useQuery({
        queryKey: ['inventory-items', proyectoId, options],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<InventoryItemsResponse>(
                INVENTORY_QUERIES.GET_INVENTORY_ITEMS,
                { proyecto_id: proyectoId, ...options }
            );
            return response.inventoryItems;
        },
        enabled: !!proyectoId,
    });
};

export const useInventoryItem = (id: string) => {
    return useQuery({
        queryKey: ['inventory-item', id],
        queryFn: async () => {
            const client = await getGraphQLClient();
            const response = await client.request<InventoryItemResponse>(
                INVENTORY_QUERIES.GET_INVENTORY_ITEM,
                { id }
            );
            return response.inventoryItem;
        },
        enabled: !!id,
    });
};

export const useCreateInventoryItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: InventoryItemInput) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ createInventoryItem: InventoryItem }>(
                INVENTORY_MUTATIONS.CREATE_INVENTORY_ITEM,
                input
            );
            return response.createInventoryItem;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['inventory-items', variables.proyecto_id] });
        },
    });
};

export const useUpdateInventoryItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...input
        }: InventoryItemInput & { id: string }) => {
            const client = await getGraphQLClient();
            const response = await client.request<{ updateInventoryItem: InventoryItem }>(
                INVENTORY_MUTATIONS.UPDATE_INVENTORY_ITEM,
                { id, ...input }
            );
            return response.updateInventoryItem;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['inventory-items', variables.proyecto_id] });
            queryClient.invalidateQueries({ queryKey: ['inventory-item', variables.id] });
        },
    });
};

export const useDeleteInventoryItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, proyecto_id }: { id: string; proyecto_id: string }) => {
            const client = await getGraphQLClient();
            await client.request(
                INVENTORY_MUTATIONS.DELETE_INVENTORY_ITEM,
                { id, proyecto_id }
            );
            return id;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['inventory-items', variables.proyecto_id] });
        },
    });
};
