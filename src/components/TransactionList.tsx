import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types/investment';
import { formatCurrency } from '../utils/calculations';

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, currency }) => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getTxDetails = (tx: Transaction) => {
    switch (tx.type) {
      case 'BUY':
        return {
          label: 'Aportación de Capital',
          color: '#3b82f6',
          bg: '#1e3a8a33',
          sign: '-',
          value: formatCurrency(tx.amount, currency),
          feeText: tx.fee ? `Comisión: ${formatCurrency(tx.fee, currency)}` : null,
        };
      case 'PAYOUT':
        const net = tx.netAmount !== undefined ? tx.netAmount : (tx.amount - (tx.fee || 0));
        return {
          label: 'Reparto / Cobro Recibido',
          color: '#10b981',
          bg: '#064e3b33',
          sign: '+',
          value: formatCurrency(net, currency),
          feeText: tx.fee ? `Bruto: ${formatCurrency(tx.amount, currency)} (Ret./Comisión: -${formatCurrency(tx.fee, currency)})` : null,
        };
      case 'VALUATION':
        return {
          label: 'Actualización de Valoración',
          color: '#a855f7',
          bg: '#581c8733',
          sign: '=',
          value: formatCurrency(tx.amount, currency),
          feeText: null,
        };
      case 'EXPENSE':
        return {
          label: 'Gasto / Comisión de Gestión',
          color: '#f59e0b',
          bg: '#78350f33',
          sign: '-',
          value: formatCurrency(tx.amount, currency),
          feeText: null,
        };
      case 'SELL':
        return {
          label: 'Liquidación / Salida',
          color: '#06b6d4',
          bg: '#164e6333',
          sign: '+',
          value: formatCurrency(tx.amount, currency),
          feeText: tx.fee ? `Comisión salida: ${formatCurrency(tx.fee, currency)}` : null,
        };
    }
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay movimientos registrados todavía.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sorted.map((tx) => {
        const details = getTxDetails(tx);
        return (
          <View key={tx.id} style={styles.item}>
            <View style={styles.rowTop}>
              <View style={[styles.badge, { backgroundColor: details.bg, borderColor: details.color }]}>
                <Text style={[styles.badgeText, { color: details.color }]}>{details.label}</Text>
              </View>
              <Text style={styles.date}>{tx.date}</Text>
            </View>

            <View style={styles.rowMain}>
              <Text style={styles.notes} numberOfLines={2}>
                {tx.notes || 'Sin descripción adicional'}
              </Text>
              <Text style={[styles.amount, { color: details.color }]}>
                {details.sign} {details.value}
              </Text>
            </View>

            {details.feeText && (
              <Text style={styles.feeInfo}>{details.feeText}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131b2e',
    borderRadius: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  item: {
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    color: '#64748b',
  },
  rowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  notes: {
    flex: 1,
    fontSize: 13,
    color: '#cbd5e1',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  feeInfo: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 4,
  },
});

