import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: string;
  icon?: string;
  isHighlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  subValueColor = '#94a3b8',
  isHighlight = false,
}) => {
  return (
    <View style={[styles.card, isHighlight && styles.highlightCard]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={[styles.value, isHighlight && styles.highlightValue]}>{value}</Text>
      {subValue ? (
        <Text style={[styles.subValue, { color: subValueColor }]}>{subValue}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    flex: 1,
    minWidth: 140,
  },
  highlightCard: {
    backgroundColor: '#172554',
    borderColor: '#1d4ed8',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  highlightValue: {
    color: '#60a5fa',
  },
  subValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

