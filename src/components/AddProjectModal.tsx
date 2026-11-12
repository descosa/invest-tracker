import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { InvestmentCategory, InvestmentProject } from '../types/investment';
import { getCategoryColor, getCategoryLabel } from '../utils/calculations';

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (project: InvestmentProject) => void;
}

const CATEGORIES: InvestmentCategory[] = [
  'real_estate',
  'startup',
  'stocks',
  'crypto',
  'crowdlending',
  'debt',
  'business',
  'other',
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ visible, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<InvestmentCategory>('real_estate');
  const [initialAmount, setInitialAmount] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [targetReturn, setTargetReturn] = useState('');
  const [currency, setCurrency] = useState('€');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;

    const principal = parseFloat(initialAmount.replace(',', '.')) || 0;
    const fee = parseFloat(entryFee.replace(',', '.')) || 0;
    const target = parseFloat(targetReturn.replace(',', '.')) || undefined;
    const today = new Date().toISOString().split('T')[0];

    const newProject: InvestmentProject = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      category,
      startDate: today,
      currency: currency.trim() || '€',
      targetReturnRate: target,
      status: 'active',
      notes: notes.trim(),
      transactions: principal > 0 ? [
        {
          id: `tx-${Date.now()}-1`,
          type: 'BUY',
          date: today,
          amount: principal,
          fee: fee,
          notes: 'Aportación inicial de capital',
        },
      ] : [],
    };

    onSave(newProject);
    // Reset form
    setTitle('');
    setInitialAmount('');
    setEntryFee('');
    setTargetReturn('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Nuevo Proyecto de Inversión</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {/* Título */}
            <Text style={styles.inputLabel}>NOMBRE DEL PROYECTO *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Local Comercial Valencia, Startup X..."
              placeholderTextColor="#64748b"
              value={title}
              onChangeText={setTitle}
            />

            {/* Categoría */}
            <Text style={styles.inputLabel}>TIPO DE ACTIVO</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const catColor = getCategoryColor(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryOption,
                      isSelected && { backgroundColor: `${catColor}33`, borderColor: catColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        isSelected && { color: catColor, fontWeight: '700' },
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Capital Inicial y Comisiones */}
            <View style={styles.rowInputs}>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>CAPITAL INVERTIDO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={initialAmount}
                  onChangeText={setInitialAmount}
                />
              </View>

              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>COMISIÓN ENTRADA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={entryFee}
                  onChangeText={setEntryFee}
                />
              </View>
            </View>

            {/* Rentabilidad objetivo y Moneda */}
            <View style={styles.rowInputs}>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>OBJETIVO ANUAL (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 10.5"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={targetReturn}
                  onChangeText={setTargetReturn}
                />
              </View>

              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>MONEDA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="€"
                  placeholderTextColor="#64748b"
                  value={currency}
                  onChangeText={setCurrency}
                />
              </View>
            </View>

            {/* Notas */}
            <Text style={styles.inputLabel}>NOTAS / TESIS DE INVERSIÓN</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalles sobre el vehículo, socios, horizonte temporal..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Crear Proyecto</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  closeBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  form: {
    paddingBottom: 40,
    gap: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
    gap: 6,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

