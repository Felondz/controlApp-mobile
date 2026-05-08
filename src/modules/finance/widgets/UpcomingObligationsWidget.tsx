import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { formatCurrency } from '../../../shared/currency';
import { DocumentTextIcon, CalendarIcon, CheckCircleIcon } from '../../../shared/icons';
import { Transaccion, usePayTransaccion } from '../../../hooks/graphql/useFinance';
import { useTranslate } from '../../../shared/hooks';

interface UpcomingObligationsWidgetProps {
    obligations: Transaccion[];
    proyectoId: string;
    theme: any;
}

/**
 * UpcomingObligationsWidget - Centered on Pending Invoices (Bills)
 */
export const UpcomingObligationsWidget = ({ 
    obligations = [], 
    proyectoId,
    theme 
}: UpcomingObligationsWidgetProps) => {
    const { t } = useTranslate();
    const { mutateAsync: payTransaccion, isPending } = usePayTransaccion();

    // Filtramos solo las que tienen número de factura (bills/invoices) y están pendientes
    const pendingBills = Array.isArray(obligations) 
        ? obligations.filter(tx => tx.numero_factura && tx.status === 'pending')
        : [];

    const handlePay = async (id: string, description: string) => {
        Alert.alert(
            t('finance.confirm_payment_title', 'Confirmar Pago'),
            t('finance.confirm_payment_message', `¿Estás seguro de marcar como pagada la factura: ${description}?`),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { 
                    text: t('common.confirm'), 
                    onPress: async () => {
                        try {
                            await payTransaccion({ id, proyecto_id: proyectoId });
                            Alert.alert(t('common.success'), t('finance.payment_success', 'Factura pagada correctamente'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('finance.payment_error', 'Error al procesar el pago'));
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-100 dark:border-secondary-800 shadow-sm">
            <View className="flex-row items-center justify-between mb-5">
                <View>
                    <Text className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black tracking-[2px] mb-1 uppercase">
                        {t('finance.pending_bills_label', 'Finanzas')}
                    </Text>
                    <Text className="text-xl font-black text-secondary-900 dark:text-white">
                        {t('finance.pending_bills_title', 'Facturas por Pagar')}
                    </Text>
                </View>
                <View className="bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                    <Text className="text-primary-600 dark:text-primary-400 text-xs font-bold">
                        {pendingBills.length}
                    </Text>
                </View>
            </View>

            {pendingBills.length === 0 ? (
                <View className="py-8 items-center justify-center">
                    <View className="bg-success-50 dark:bg-success-900/20 p-3 rounded-full mb-3">
                        <CheckCircleIcon size={24} color="#10b981" />
                    </View>
                    <Text className="text-secondary-500 dark:text-secondary-400 text-sm font-medium text-center">
                        {t('finance.no_pending_bills', 'No tienes facturas pendientes')}
                    </Text>
                </View>
            ) : (
                <View className="gap-4">
                    {pendingBills.slice(0, 5).map((item) => {
                        const isOverdue = item.fecha_vencimiento && new Date(item.fecha_vencimiento) < new Date();
                        
                        return (
                            <View 
                                key={item.id}
                                className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/40 border border-secondary-100 dark:border-secondary-800"
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-secondary-400 dark:text-secondary-500 text-[9px] font-bold mb-1">
                                            #{item.numero_factura}
                                        </Text>
                                        <Text className="text-secondary-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                                            {item.descripcion || item.categoria?.nombre || t('finance.expense')}
                                        </Text>
                                    </View>
                                    <Text className="text-secondary-900 dark:text-white font-black text-sm">
                                        {formatCurrency(item.monto || 0, item.cuenta?.moneda)}
                                    </Text>
                                </View>

                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-1.5">
                                        <CalendarIcon size={12} color={isOverdue ? '#ef4444' : '#94a3b8'} />
                                        <Text className={`text-[10px] font-bold ${isOverdue ? 'text-danger-600' : 'text-secondary-500'}`}>
                                            {item.fecha_vencimiento || item.fecha}
                                        </Text>
                                    </View>

                                    <TouchableOpacity 
                                        onPress={() => handlePay(item.id, item.descripcion || '')}
                                        disabled={isPending}
                                        className="bg-primary-500 px-4 py-2 rounded-xl active:scale-95 transition-all"
                                    >
                                        {isPending ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white font-bold text-[11px]">
                                                {t('finance.pay_action', 'Pagar')}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};
