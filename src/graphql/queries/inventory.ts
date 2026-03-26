export const INVENTORY_QUERIES = {
    GET_INVENTORY_ITEMS: `
        query GetInventoryItems($proyecto_id: ID!, $first: Int = 15, $page: Int, $name: String, $type: String, $is_active: Boolean) {
            inventoryItems(
                proyecto_id: $proyecto_id
                first: $first
                page: $page
                name: $name
                type: $type
                is_active: $is_active
            ) {
                paginatorInfo {
                    count
                    currentPage
                    firstItem
                    hasMorePages
                    lastItem
                    lastPage
                    perPage
                    total
                }
                data {
                    id
                    proyecto_id
                    name
                    sku
                    type
                    unit
                    current_stock
                    min_stock_level
                    cost_price
                    sale_price
                    image_path
                    is_active
                    created_at
                    updated_at
                }
            }
        }
    `,

    GET_INVENTORY_ITEM: `
        query GetInventoryItem($id: ID!) {
            inventoryItem(id: $id) {
                id
                proyecto_id
                name
                sku
                type
                unit
                current_stock
                min_stock_level
                cost_price
                sale_price
                image_path
                is_active
                created_at
                updated_at
            }
        }
    `,
};

export const INVENTORY_MUTATIONS = {
    CREATE_INVENTORY_ITEM: `
        mutation CreateInventoryItem(
            $proyecto_id: ID!
            $name: String!
            $type: String!
            $unit: String!
            $sku: String
            $min_stock_level: Float
            $initial_quantity: Float
            $initial_cost: Float
            $sale_price: Float
        ) {
            createInventoryItem(
                proyecto_id: $proyecto_id
                name: $name
                type: $type
                unit: $unit
                sku: $sku
                min_stock_level: $min_stock_level
                initial_quantity: $initial_quantity
                initial_cost: $initial_cost
                sale_price: $sale_price
            ) {
                id
                proyecto_id
                name
                sku
                type
                unit
                current_stock
                min_stock_level
                cost_price
                sale_price
                is_active
                created_at
            }
        }
    `,

    UPDATE_INVENTORY_ITEM: `
        mutation UpdateInventoryItem(
            $id: ID!
            $proyecto_id: ID!
            $name: String!
            $type: String!
            $unit: String!
            $sku: String
            $min_stock_level: Float
            $sale_price: Float
            $stock_adjustment: Float
        ) {
            updateInventoryItem(
                id: $id
                proyecto_id: $proyecto_id
                name: $name
                type: $type
                unit: $unit
                sku: $sku
                min_stock_level: $min_stock_level
                sale_price: $sale_price
                stock_adjustment: $stock_adjustment
            ) {
                id
                proyecto_id
                name
                sku
                type
                unit
                current_stock
                min_stock_level
                cost_price
                sale_price
                is_active
                updated_at
            }
        }
    `,

    DELETE_INVENTORY_ITEM: `
        mutation DeleteInventoryItem($id: ID!, $proyecto_id: ID!) {
            deleteInventoryItem(id: $id, proyecto_id: $proyecto_id)
        }
    `,
};
