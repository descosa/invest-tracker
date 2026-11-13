import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { InvestmentProject } from './src/types/investment';
import { loadProjects, saveProjects, resetToDemoProjects } from './src/storage/projectStorage';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { AddProjectModal } from './src/components/AddProjectModal';

export default function App() {
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [addProjectVisible, setAddProjectVisible] = useState(false);

  useEffect(() => {
    async function init() {
      const data = await loadProjects();
      setProjects(data);
      setLoading(false);
    }
    init();
  }, []);

  const handleUpdateProject = async (updated: InvestmentProject) => {
    const next = projects.map((p) => (p.id === updated.id ? updated : p));
    setProjects(next);
    await saveProjects(next);
  };

  const handleAddProject = async (newProject: InvestmentProject) => {
    const next = [newProject, ...projects];
    setProjects(next);
    await saveProjects(next);
  };

  const handleDeleteProject = async (projectId: string) => {
    const next = projects.filter((p) => p.id !== projectId);
    setProjects(next);
    setSelectedProjectId(null);
    await saveProjects(next);
  };

  const handleResetDemo = async () => {
    const demo = await resetToDemoProjects();
    setProjects(demo);
    setSelectedProjectId(null);
  };

  const handleRefresh = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // En web/PWA recarga la página para obtener también la última versión desplegada
      window.location.reload();
      return;
    }
    const data = await loadProjects();
    setProjects(data);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Cargando cartera...</Text>
      </View>
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {selectedProject ? (
        <ProjectDetailScreen
          project={selectedProject}
          onBack={() => setSelectedProjectId(null)}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        <DashboardScreen
          projects={projects}
          onSelectProject={(p) => setSelectedProjectId(p.id)}
          onOpenAddProject={() => setAddProjectVisible(true)}
          onResetDemo={handleResetDemo}
          onRefresh={handleRefresh}
        />
      )}

      <AddProjectModal
        visible={addProjectVisible}
        onClose={() => setAddProjectVisible(false)}
        onSave={handleAddProject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  center: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
});
