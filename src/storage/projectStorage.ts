import AsyncStorage from '@react-native-async-storage/async-storage';
import { InvestmentProject } from '../types/investment';
import { INITIAL_PROJECTS } from '../data/initialData';

const STORAGE_KEY = '@invest_tracker_projects_v1';

export async function loadProjects(): Promise<InvestmentProject[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Primera vez: cargar proyectos de ejemplo
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error al cargar proyectos de storage:', err);
    return INITIAL_PROJECTS;
  }
}

export async function saveProjects(projects: InvestmentProject[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error al guardar proyectos en storage:', err);
  }
}

export async function resetToDemoProjects(): Promise<InvestmentProject[]> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  } catch (err) {
    console.error('Error al reiniciar proyectos demo:', err);
    return INITIAL_PROJECTS;
  }
}

