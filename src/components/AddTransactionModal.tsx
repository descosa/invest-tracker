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
import { Transaction, TransactionType } from '../types/investment';

interface AddTransactionModalProps {
  visible: boolean;
  currency: string;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
}

const TX_TYPES: { type: TransactionType; label: string; desc: string; color: string }[] = [
  { type: 'PAYOUT', label: 'Reparto de Pago', desc: 'Dividendo, alquiler, cupón o retorno', color: '#10b981' },
  { type: 'VALUATION', label: 'Nueva Valoración', desc: 'Subida o bajada de tasación/precio', color: '#a855f7' },
  { type: 'EXPENSE', label: 'Comisión / Gasto', desc: 'Gestión, custodia, seguro, comunidad', color: '#f59e0b' },
  { type: 'BUY', label: 'Ampliación Capital', desc: 'Inversión adicional en este proyecto', color: '#3b82f6' },
  { type: 'SELL', label: 'Venta / Salida', desc: 'Liquidación total o parcial del activo', color: '#06b6d4' },
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  currency,
  onClose,
  onSave,
}) => {
  const [selectedType, setSelectedType] = useState<TransactionType>('PAYOUT');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const val = parseFloat(amount.replace(',', '.')) || 0;
    const feeVal = parseFloat(fee.replace(',', '.')) || 0;
    if (val <= 0 && selectedType !== 'VALUATION') return;

    const today = new Date().toISOString().split('T')[0];

    let netAmount: number | undefined = undefined;
    if (selectedType === 'PAYOUT') {
      netAmount = Math.max(0, val - feeVal);
    }

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      type: selectedType,
      date: today,
      amount: val,
      fee: feeVal > 0 ? feeVal : undefined,
      netAmount,
      notes: notes.trim() || undefined,
    };

    onSave(tx);
    // Reset
    setAmount('');
    setFee('');
    setNotes('');
    onClose();
  };

  const getAmountPlaceholder = () => {
    switch (selectedType) {
      case 'PAYOUT':
        return 'Importe bruto recibido';
      case 'VALUATION':
        return 'Nuevo valor total del activo';
      case 'EXPENSE':
        return 'Importe del gasto / comisión';
      case 'BUY':
        return 'Importe de la aportación';
      case 'SELL':
        return 'Precio de venta obtenido';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Registrar Movimiento</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {/* Selector de Tipo */}
            <Text style={styles.inputLabel}>TIPO DE EVENTO FINANCIERO</Text>
            <View style={styles.typeList}>
              {TX_TYPES.map((item) => {
                const isSelected = selectedType === item.type;
                return (
                  <TouchableOpacity
                    key={item.type}
                    onPress={() => setSelectedType(item.type)}
                    style={[
                      styles.typeCard,
                      isSelected && { borderColor: item.color, backgroundColor: `${item.color}22` },
                    ]}
                  >
                    <View style={styles.typeHeader}>
                      <Text style={[styles.typeLabel, isSelected && { color: item.color, fontWeight: '700' }]}>
                        {item.label}
                      </Text>
                    </View>
                    <Text style={styles.typeDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Importe */}
            <Text style={styles.inputLabel}>IMPORTE ({currency}) *</Text>
            <TextInput
              style={styles.input}
              placeholder={getAmountPlaceholder()}
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Comisiones o Retenciones si aplica */}
            {(selectedType === 'PAYOUT' || selectedType === 'BUY' || selectedType === 'SELL') && (
              <View>
                <Text style={styles.inputLabel}>
                  {selectedType === 'PAYOUT' ? 'RETENCIÓN FISCAL / COMISIÓN GESTIÓN' : 'COMISIÓN O GASTO ASOCIADO'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={fee}
                  onChangeText={setFee}
                />
              </View>
            )}

            {/* Notas / Concepto */}
            <Text style={styles.inputLabel}>CONCEPTO / DESCRIPCIÓN</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Dividendo 2T, Tasación oficial, IBI, Cuota..."
              placeholderTextColor="#64748b"
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Guardar Movimiento</Text>
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
  typeList: {
    gap: 8,
  },
  typeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeLabel: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  typeDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#10b981',
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

