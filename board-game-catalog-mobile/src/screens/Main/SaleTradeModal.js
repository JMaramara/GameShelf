// src/screens/Main/SaleTradeModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Switch, SafeAreaView } from 'react-native';

const SaleTradeModal = ({ visible, onClose, onSave, initialStatus, initialNotes }) => {
  // Internal state for the modal's form
  const [forSale, setForSale] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);

  // This ensures the modal updates if the initial props change
  useEffect(() => {
    setForSale(initialStatus);
    setNotes(initialNotes);
  }, [initialStatus, initialNotes]);

  const handleSave = () => {
    // Pass the updated data back to the parent screen
    onSave({
      for_sale_trade: forSale,
      sale_trade_notes: notes,
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <SafeAreaView style={styles.modalView}>
          <Text style={styles.modalTitle}>Update Sale/Trade Status</Text>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Mark for Sale/Trade:</Text>
            <Switch
              value={forSale}
              onValueChange={setForSale}
            />
          </View>

          <Text style={styles.label}>Notes (Price, Condition, etc.):</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="e.g., Mint, $40 or trade for..."
            value={notes}
            onChangeText={setNotes}
            multiline
            // The form is only enabled if the switch is on
            editable={forSale}
          />

          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} color="#6c757d" />
            <Button title="Save Status" onPress={handleSave} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    input: { borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 10, fontSize: 16 },
    multilineInput: { minHeight: 100, textAlignVertical: 'top' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
});

export default SaleTradeModal;
