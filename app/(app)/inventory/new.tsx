import React from 'react';
import { Stack } from 'expo-router';
import { CreateInventoryItem } from '../../../src/modules/inventory';

export default function CreateInventoryScreen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <CreateInventoryItem />
        </>
    );
}
