import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { InvestmentCategory, InvestmentProject } from '../types/investment';
import {
  calculatePortfolioMetrics,
  formatCurrency,
  formatPercentage,
  getCategoryLabel,
  getCategoryColor,
} from '../utils/calculations';
import { MetricCard } from '../components/MetricCard';
import { ProjectCard } from '../components/ProjectCard';

interface DashboardScreenProps {
  projects: InvestmentProject[];
  onSelectProject: (project: InvestmentProject) => void;
  onOpenAddProject: () => void;
  onResetDemo: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  projects,
  onSelectProject,
  onOpenAddProject,
  onResetDemo,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InvestmentCategory | 'ALL'>('ALL');
  const metrics = calculatePortfolioMetrics(projects);
  const isProfitable = metrics.totalNetProfit >= 0;

  const filteredProjects = selectedCategory === 'ALL'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  // Categorías presentes en los proyectos actuales
  const availableCategories = Array.from(new Set(projects.map((p) => p.category)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Header Superior */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appTitle}>INVEST TRACKER</Text>
            <Text style={styles.appSubtitle}>Cartera Profesional Multiactivo</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={onOpenAddProject}>
            <Text style={styles.addBtnText}>+ Proyecto</Text>
          </TouchableOpacity>
        </View>

        {/* Resumen Principal de Cartera */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>VALORACIÓN TOTAL DE LA CARTERA</Text>
          <Text style={styles.heroValue}>{formatCurrency(metrics.totalCurrentValue)}</Text>

          <View style={styles.heroProfitRow}>
            <View style={[styles.profitBadge, { backgroundColor: isProfitable ? '#064e3b55' : '#7f1d1d55' }]}>
              <Text style={[styles.profitText, { color: isProfitable ? '#10b981' : '#ef4444' }]}>
                {metrics.totalNetProfit > 0 ? '+' : ''}{formatCurrency(metrics.totalNetProfit)}
              </Text>
            </View>
            <Text style={[styles.heroRoi, { color: isProfitable ? '#10b981' : '#ef4444' }]}>
              ROI: {formatPercentage(metrics.portfolioRoi)}
            </Text>
          </View>

          <View style={styles.heroDivider} />

          {/* Métricas secundarias en fila */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricSubLabel}>Capital Invertido</Text>
              <Text style={styles.metricSubValue}>{formatCurrency(metrics.totalInvestedCapital)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricSubLabel}>Repartos Cobrados</Text>
              <Text style={[styles.metricSubValue, { color: '#38bdf8' }]}>
                {formatCurrency(metrics.totalNetPayouts)}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricSubLabel}>Comisiones Pagadas</Text>
              <Text style={[styles.metricSubValue, { color: '#f59e0b' }]}>
                {formatCurrency(metrics.totalFeesPaid)}
              </Text>
            </View>
          </View>
        </View>

        {/* Filtros de Categoría */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              onPress={() => setSelectedCategory('ALL')}
              style={[
                styles.filterChip,
                selectedCategory === 'ALL' && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === 'ALL' && styles.filterTextActive,
                ]}
              >
                Todos ({projects.length})
              </Text>
            </TouchableOpacity>

            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const catColor = getCategoryColor(cat);
              const count = projects.filter((p) => p.category === cat).length;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.filterChip,
                    isSelected && { backgroundColor: `${catColor}33`, borderColor: catColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && { color: catColor, fontWeight: '700' },
                    ]}
                  >
                    {getCategoryLabel(cat)} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Lista de Proyectos */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              Proyectos ({filteredProjects.length})
            </Text>
            <TouchableOpacity onPress={onResetDemo}>
              <Text style={styles.resetText}>Restablecer Demo</Text>
            </TouchableOpacity>
          </View>

          {filteredProjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No hay proyectos en esta categoría</Text>
              <Text style={styles.emptyDesc}>Pulsa "+ Proyecto" para crear el primero.</Text>
            </View>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => onSelectProject(project)}
              />
            ))
          )}
        </View>
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
    paddingBottom: Platform.OS === 'web' ? 40 : 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 18,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -1,
  },
  heroProfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  profitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  profitText: {
    fontSize: 14,
    fontWeight: '800',
  },
  heroRoi: {
    fontSize: 14,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricSubLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  metricSubValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#131b2e',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listSection: {
    gap: 8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
  },
  resetText: {
    fontSize: 12,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
  emptyState: {
    padding: 30,
    backgroundColor: '#131b2e',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748b',
  },
});

