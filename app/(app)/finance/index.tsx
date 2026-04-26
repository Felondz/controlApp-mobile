import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import FinanceDashboardScreen from '../../../src/modules/finance/screens/FinanceDashboardScreen';

/**
 * Finance Index - Final Stable Version
 */
export default function FinanceIndex() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return <FinanceDashboardScreen />;
}
