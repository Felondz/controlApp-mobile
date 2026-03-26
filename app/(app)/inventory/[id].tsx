import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { InventoryItemDetail } from '../../../src/modules/inventory';

export default function InventoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    
    if (!id) {
        return null;
    }
    
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <InventoryItemDetail itemId={id} />
        </>
    );
}
