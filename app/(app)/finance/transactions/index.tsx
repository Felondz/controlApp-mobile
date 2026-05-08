import React from 'react';
import TransactionsListScreen from '../../../../src/modules/finance/screens/TransactionsListScreen';
import { useProjectStore } from '../../../../src/stores/projectStore';
import { useLocalSearchParams } from 'expo-router';

export default function TransactionsRoute() {
    const { activeProject } = useProjectStore();
    const { accountId } = useLocalSearchParams<{ accountId: string }>();

    if (!activeProject) return null;

    return (
        <TransactionsListScreen 
            proyectoId={activeProject.id} 
            initialAccountId={accountId}
        />
    );
}
