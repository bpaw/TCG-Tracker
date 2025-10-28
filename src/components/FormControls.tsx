import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

interface FormLabelProps {
  text: string;
  required?: boolean;
}

export function FormLabel({ text, required }: FormLabelProps) {
  const isDark = false; // Force light mode

  return (
    <Text style={[styles.label, isDark && styles.labelDark]}>
      {text}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

interface FormInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  error?: string;
}

export function FormInput({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  error,
}: FormInputProps) {
  const isDark = false; // Force light mode

  return (
    <View>
      <TextInput
        style={[
          styles.input,
          isDark && styles.inputDark,
          multiline && styles.inputMultiline,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#98989F' : '#8E8E93'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface SegmentedControlProps {
  options: readonly string[];
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
}

export function SegmentedControl({
  options,
  selectedValue,
  onValueChange,
}: SegmentedControlProps) {
  const isDark = false; // Force light mode

  return (
    <View style={[styles.segmentedContainer, isDark && styles.segmentedContainerDark]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.segment,
            selectedValue === option && styles.segmentActive,
            selectedValue === option && isDark && styles.segmentActiveDark,
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text
            style={[
              styles.segmentText,
              isDark && styles.segmentTextDark,
              selectedValue === option && styles.segmentTextActive,
              selectedValue === option && isDark && styles.segmentTextActiveDark,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

interface ChipSelectProps {
  options: readonly string[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  customEnabled?: boolean;
}

export function ChipSelect({
  options,
  selectedValue,
  onValueChange,
  customEnabled = false,
}: ChipSelectProps) {
  const isDark = false; // Force light mode

  return (
    <View style={styles.chipContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.chip,
            isDark && styles.chipDark,
            selectedValue === option && styles.chipActive,
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text
            style={[
              styles.chipText,
              isDark && styles.chipTextDark,
              selectedValue === option && styles.chipTextActive,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  labelDark: {
    color: '#fff',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    minHeight: 44,
  },
  inputDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
    color: '#fff',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 2,
  },
  segmentedContainerDark: {
    backgroundColor: '#2C2C2E',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#fff',
  },
  segmentActiveDark: {
    backgroundColor: '#1C1C1E',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  segmentTextDark: {
    color: '#fff',
  },
  segmentTextActive: {
    color: '#007AFF',
  },
  segmentTextActiveDark: {
    color: '#0A84FF',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  chipDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#2C2C2E',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  chipTextDark: {
    color: '#fff',
  },
  chipTextActive: {
    color: '#fff',
  },
});
