import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { InvestmentProject } from '../types/investment';
import {
  calculateProjectMetrics,
  formatCurrency,
  formatPercentage,
  getCategoryColor,
  getCategoryLabel,
} from '../utils/calculations';

interface ProjectCardProps {
  project: InvestmentProject;
  onPress: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const metrics = calculateProjectMetrics(project);
  const categoryColor = getCategoryColor(project.category);
  const categoryLabel = getCategoryLabel(project.category);
  const isPositive = metrics.totalNetProfit >= 0;

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}22`, borderColor: categoryColor }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{categoryLabel}</Text>
          </View>
          {project.status === 'exited' && (
            <View style={styles.exitedBadge}>
              <Text style={styles.exitedText}>CERRADO / VENDIDO</Text>
            </View>
          )}
        </View>
        <Text style={[styles.roiBadge, { color: isPositive ? '#10b981' : '#ef4444' }]}>
          {formatPercentage(metrics.roiPercentage)}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>{project.title}</Text>

      {/* Main Value Banner */}
      <View style={styles.valueRow}>
        <View>
          <Text style={styles.metricLabel}>VALORACIÓN ACTUAL</Text>
          <Text style={styles.mainValue}>{formatCurrency(metrics.currentValuation, project.currency)}</Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={styles.metricLabel}>GANANCIA / P&L NETO</Text>
          <Text style={[styles.profitValue, { color: isPositive ? '#10b981' : '#ef4444' }]}>
            {metrics.totalNetProfit > 0 ? '+' : ''}{formatCurrency(metrics.totalNetProfit, project.currency)}
          </Text>
        </View>
      </View>

      {/* Breakdown Row */}
      <View style={styles.divider} />
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Invertido</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(metrics.investedCapital, project.currency)}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Repartos Netos</Text>
          <Text style={[styles.breakdownValue, { color: metrics.netPayouts > 0 ? '#38bdf8' : '#94a3b8' }]}>
            {formatCurrency(metrics.netPayouts, project.currency)}
          </Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Comisiones</Text>
          <Text style={[styles.breakdownValue, { color: metrics.totalFees > 0 ? '#f59e0b' : '#94a3b8' }]}>
            {formatCurrency(metrics.totalFees, project.currency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exitedBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  exitedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  roiBadge: {
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  mainValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  profitValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
});

