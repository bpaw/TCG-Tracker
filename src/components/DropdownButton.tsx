import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownButtonProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DropdownButton({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
}: DropdownButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const isDark = false; // Force light mode

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, isDark && styles.buttonDark]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
          {displayText}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                    {label}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.optionsList}>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.option,
                        option.value === value && styles.optionSelected,
                      ]}
                      onPress={() => handleSelect(option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          option.value === value && styles.optionTextSelected,
                          isDark && styles.optionTextDark,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {option.value === value && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Removed flex: 1 to avoid nested flex issues
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  labelDark: {
    color: '#98989F',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  buttonDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  buttonTextDark: {
    color: '#fff',
  },
  arrow: {
    fontSize: 10,
    color: '#8E8E93',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalContentDark: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  modalTitleDark: {
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#8E8E93',
    paddingHorizontal: 8,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  optionSelected: {
    backgroundColor: '#F0F0F5',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionTextDark: {
    color: '#fff',
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '700',
  },
});
