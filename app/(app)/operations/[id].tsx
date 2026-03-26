import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LoteDetail } from '../../../src/modules/operations';

export default function LoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    
    if (!id) {
        return null;
    }
    
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LoteDetail loteId={id} />
        </>
    );
}
