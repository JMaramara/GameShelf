// src/screens/Main/LogPlayModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, ScrollView, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const LogPlayModal = ({ visible, onClose, onSave, gameTitle }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rating, setRating] = useState('');
  const [players, setPlayers] = useState('');
  const [gameStateNotes, setGameStateNotes] = useState('');
  const [postGameNotes, setPostGameNotes] = useState('');

  const resetForm = () => {
    setDate(new Date());
    setRating('');
    setPlayers('');
    setGameStateNotes('');
    setPostGameNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    const playData = {
      date: date.toISOString().split('T')[0],
      rating: rating ? parseInt(rating, 10) : null,
      players,
      game_state_notes: gameStateNotes,
      notes: postGameNotes,
    };
    onSave(playData);
    resetForm();
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <SafeAreaView style={styles.modalView}>
          <ScrollView style={{width: '100%'}} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Log a Play for</Text>
            <Text style={styles.modalSubtitle}>{gameTitle}</Text>

            <Text style={styles.label}>Date of Play</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateDisplay}>
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            <Text style={styles.label}>Players (comma-separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Julio, Camilo, Cristobal"
              value={players}
              onChangeText={setPlayers}
            />

            <Text style={styles.label}>Game State Notes (to save a game)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="e.g., Round 3, Camilo's turn..."
              value={gameStateNotes}
              onChangeText={setGameStateNotes}
              multiline
            />

            <Text style={styles.label}>Post-Game Notes</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="e.g., Great comeback win!"
              value={postGameNotes}
              onChangeText={setPostGameNotes}
              multiline
            />

            <Text style={styles.label}>Rating (1-10)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 8"
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
            />

            <View style={styles.buttonContainer}>
              <Button title="Cancel" onPress={handleClose} color="#dc3545" />
              <Button title="Save Play" onPress={handleSave} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', maxHeight: '85%'},
    modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    modalSubtitle: { fontSize: 16, marginBottom: 15, textAlign: 'center', color: '#666' },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, alignSelf: 'flex-start' },
    dateDisplay: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, width: '100%', marginTop: 5, marginBottom: 10, justifyContent: 'center', paddingHorizontal: 10 },
    dateText: { fontSize: 16 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, width: '100%', marginTop: 5, marginBottom: 10, paddingHorizontal: 10, fontSize: 16 },
    multilineInput: { height: 100, textAlignVertical: 'top' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, marginBottom: 20 },
});

export default LogPlayModal;
