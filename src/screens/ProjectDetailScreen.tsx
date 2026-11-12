import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { InvestmentProject, Transaction } from '../types/investment';
import {
  calculateProjectMetrics,
  formatCurrency,
  formatPercentage,
  getCategoryColor,
  getCategoryLabel,
} from '../utils/calculations';
import { TransactionList } from '../components/TransactionList';
import { AddTransactionModal } from '../components/AddTransactionModal';

interface ProjectDetailScreenProps {
  project: InvestmentProject;
  onBack: () => void;
  onUpdateProject: (updated: InvestmentProject) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  project,
  onBack,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const metrics = calculateProjectMetrics(project);
  const categoryColor = getCategoryColor(project.category);
  const categoryLabel = getCategoryLabel(project.category);
  const isPositive = metrics.totalNetProfit >= 0;

  const handleAddTransaction = (newTx: Transaction) => {
    const updated: InvestmentProject = {
      ...project,
      transactions: [...project.transactions, newTx],
      status: newTx.type === 'SELL' ? 'exited' : project.status,
    };
    onUpdateProject(updated);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Proyecto',
      `¿Estás seguro de que deseas eliminar "${project.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteProject(project.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver a Cartera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {/* Header con Etiquetas */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}22`, borderColor: categoryColor }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>{categoryLabel}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: project.status === 'active' ? '#064e3b44' : '#334155' }]}>
              <Text style={[styles.statusText, { color: project.status === 'active' ? '#10b981' : '#cbd5e1' }]}>
                {project.status === 'active' ? 'ACTIVO' : 'CERRADO / VENDIDO'}
              </Text>
            </View>
            {project.targetReturnRate && (
              <View style={styles.targetBadge}>
                <Text style={styles.targetText}>Obj: {project.targetReturnRate}%</Text>
              </View>
            )}
          </View>
          <Text style={styles.projectTitle}>{project.title}</Text>
          {project.notes ? <Text style={styles.notesText}>{project.notes}</Text> : null}
        </View>

        {/* Hero Card de P&L y Valoración */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroSubLabel}>VALORACIÓN ACTUAL</Text>
              <Text style={styles.heroMainValue}>
                {formatCurrency(metrics.currentValuation, project.currency)}
              </Text>
            </View>
            <View style={styles.alignRight}>
              <Text style={styles.heroSubLabel}>ROI TOTAL</Text>
              <Text style={[styles.heroRoiValue, { color: isPositive ? '#10b981' : '#ef4444' }]}>
                {formatPercentage(metrics.roiPercentage)}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          {/* Desglose de Ganancia Neta */}
          <View style={styles.pnlRow}>
            <View>
              <Text style={styles.pnlLabel}>GANANCIA NETA TOTAL (P&L)</Text>
              <Text style={[styles.pnlValue, { color: isPositive ? '#10b981' : '#ef4444' }]}>
                {metrics.totalNetProfit > 0 ? '+' : ''}{formatCurrency(metrics.totalNetProfit, project.currency)}
              </Text>
            </View>
            <View style={styles.alignRight}>
              <Text style={styles.pnlLabel}>CASH-ON-CASH YIELD</Text>
              <Text style={styles.cocValue}>
                {formatPercentage(metrics.cashOnCashYield)}
              </Text>
            </View>
          </View>
        </View>

        {/* Desglose Analítico Profesional */}
        <Text style={styles.sectionHeader}>DESGLOSE FINANCIERO DETALLADO</Text>

        <View style={styles.analyticsGrid}>
          {/* Tarjeta Capital e Inversión */}
          <View style={styles.metricBox}>
            <Text style={styles.metricBoxLabel}>CAPITAL APORTADO</Text>
            <Text style={styles.metricBoxValue}>
              {formatCurrency(metrics.investedCapital, project.currency)}
            </Text>
            <Text style={styles.metricBoxDetail}>
              Coste total con comisiones: {formatCurrency(metrics.totalCostBasis, project.currency)}
            </Text>
          </View>

          {/* Tarjeta Repartos Cobrados */}
          <View style={styles.metricBox}>
            <Text style={styles.metricBoxLabel}>REPARTOS RECIBIDOS (NETO)</Text>
            <Text style={[styles.metricBoxValue, { color: '#38bdf8' }]}>
              {formatCurrency(metrics.netPayouts, project.currency)}
            </Text>
            <Text style={styles.metricBoxDetail}>
              Bruto: {formatCurrency(metrics.grossPayouts, project.currency)} (Retenciones: -{formatCurrency(metrics.payoutFees, project.currency)})
            </Text>
          </View>

          {/* Tarjeta Revalorización Latente */}
          <View style={styles.metricBox}>
            <Text style={styles.metricBoxLabel}>PLUSVALÍA DEL ACTIVO</Text>
            <Text style={[styles.metricBoxValue, { color: metrics.unrealizedCapitalGain >= 0 ? '#10b981' : '#ef4444' }]}>
              {metrics.unrealizedCapitalGain > 0 ? '+' : ''}{formatCurrency(metrics.unrealizedCapitalGain, project.currency)}
            </Text>
            <Text style={styles.metricBoxDetail}>
              Variación de tasación respecto a compra
            </Text>
          </View>

          {/* Tarjeta Total Comisiones y Costes */}
          <View style={styles.metricBox}>
            <Text style={styles.metricBoxLabel}>COMISIONES TOTALES PAGADAS</Text>
            <Text style={[styles.metricBoxValue, { color: '#f59e0b' }]}>
              {formatCurrency(metrics.totalFees, project.currency)}
            </Text>
            <Text style={styles.metricBoxDetail}>
              Entrada: {formatCurrency(metrics.entryFees, project.currency)} · Gestión: {formatCurrency(metrics.ongoingFees, project.currency)}
            </Text>
          </View>
        </View>

        {/* Botón de Acción Rápida para añadir movimiento */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={styles.addMovementBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addMovementBtnText}>+ Registrar Movimiento Financiero</Text>
          </TouchableOpacity>
        </View>

        {/* Cronología de Movimientos */}
        <View style={styles.historySection}>
          <Text style={styles.sectionHeader}>HISTORIAL DE MOVIMIENTOS ({project.transactions.length})</Text>
          <TransactionList transactions={project.transactions} currency={project.currency} />
        </View>

        {/* Modal de Transacción */}
        <AddTransactionModal
          visible={modalVisible}
          currency={project.currency}
          onClose={() => setModalVisible(false)}
          onSave={handleAddTransaction}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  backBtn: {
    paddingVertical: 6,
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  targetBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  targetText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: '#131b2e',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroMainValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  heroRoiValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 14,
  },
  pnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pnlLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  pnlValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  cocValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#38bdf8',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10,
  },
  analyticsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  metricBox: {
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  metricBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metricBoxValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  metricBoxDetail: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  actionsBar: {
    marginBottom: 20,
  },
  addMovementBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addMovementBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  historySection: {
    marginBottom: 20,
  },
});

