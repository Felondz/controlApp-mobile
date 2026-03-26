import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import {
    GET_INVENTORY_ITEMS,
    GET_INVENTORY_ITEM,
    CREATE_INVENTORY_ITEM,
    UPDATE_INVENTORY_ITEM,
    DELETE_INVENTORY_ITEM,
} from '../../services/graphql';

export interface InventoryItem {
    id: string;
    proyecto_id: number;
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

export interface InventoryItemsResponse {
    inventoryItems: {
        paginatorInfo: {
            currentPage: number;
            lastPage: number;
            perPage: number;
            total: number;
            hasMorePages: boolean;
        };
        data: InventoryItem[];
    };
}

export interface InventoryItemResponse {
    inventoryItem: InventoryItem;
}

interface CreateInventoryItemInput {
    proyecto_id: number;
    name: string;
    type: string;
    unit: string;
    sku?: string;
    min_stock_level?: number;
    initial_quantity?: number;
    initial_cost?: number;
    sale_price?: number;
}

interface UpdateInventoryItemInput extends Partial<CreateInventoryItemInput> {
    id: string;
    stock_adjustment?: number;
}

export function useInventoryItems(
    proyectoId: number,
    options: {
        name?: string;
        type?: string;
        isActive?: boolean;
        first?: number;
        page?: number;
    } = {}
) {
    return useQuery<InventoryItemsResponse>(GET_INVENTORY_ITEMS, {
        variables: {
            proyecto_id: proyectoId,
            name: options.name,
            type: options.type,
            is_active: options.isActive,
            first: options.first ?? 15,
            page: options.page ?? 1,
        },
        skip: !proyectoId,
    });
}

export function useInventoryItem(id: string) {
    return useQuery<InventoryItemResponse>(GET_INVENTORY_ITEM, {
        variables: { id },
        skip: !id,
    });
}

export function useCreateInventoryItem() {
    const client = useApolloClient();

    return useMutation<{ createInventoryItem: InventoryItem }, CreateInventoryItemInput>(
        CREATE_INVENTORY_ITEM,
        {
            onCompleted: (data) => {
                client.cache.evict({ id: client.cache.identify({ __typename: 'InventoryItem', id: data.createInventoryItem.id }) });
                client.resetStore();
            },
        }
    );
}

export function useUpdateInventoryItem() {
    const client = useApolloClient();

    return useMutation<{ updateInventoryItem: InventoryItem }, UpdateInventoryItemInput>(
        UPDATE_INVENTORY_ITEM,
        {
            onCompleted: (data) => {
                client.cache.evict({ id: client.cache.identify({ __typename: 'InventoryItem', id: data.updateInventoryItem.id }) });
                client.resetStore();
            },
        }
    );
}

export function useDeleteInventoryItem() {
    const client = useApolloClient();

    return useMutation<{ deleteInventoryItem: boolean }, { id: string; proyecto_id: number }>(
        DELETE_INVENTORY_ITEM,
        {
            onCompleted: () => {
                client.resetStore();
            },
        }
    );
}
