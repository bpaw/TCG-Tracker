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
import { colors, spacing } from '../design/tokens';

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

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
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
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
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
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface[300],
    borderWidth: 1,
    borderColor: colors.surface[400],
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  buttonText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  arrow: {
    fontSize: 10,
    color: colors.text.muted,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface[300],
    borderRadius: spacing.md,
    width: '80%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface[400],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.muted,
    paddingHorizontal: spacing.sm,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface[400],
  },
  optionSelected: {
    backgroundColor: colors.surface[200],
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.brand.violet,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: colors.brand.violet,
    fontWeight: '700',
  },
});
