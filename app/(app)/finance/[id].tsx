import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { TransactionDetail } from '../../../src/modules/finance';

export default function TransactionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    
    if (!id) {
        return null;
    }
    
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <TransactionDetail transactionId={id} />
        </>
    );
}
