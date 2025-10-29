import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing } from '../design/tokens';

interface FormLabelProps {
  text: string;
  required?: boolean;
}

export function FormLabel({ text, required }: FormLabelProps) {
  return (
    <Text style={styles.label}>
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
  return (
    <View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
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
  return (
    <View style={styles.segmentedContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.segment,
            selectedValue === option && styles.segmentActive,
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text
            style={[
              styles.segmentText,
              selectedValue === option && styles.segmentTextActive,
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
  return (
    <View style={styles.chipContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.chip,
            selectedValue === option && styles.chipActive,
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text
            style={[
              styles.chipText,
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
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.brand.coral,
  },
  input: {
    backgroundColor: colors.surface[300],
    borderWidth: 1,
    borderColor: colors.surface[400],
    borderRadius: spacing.sm,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 44,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.brand.coral,
  },
  errorText: {
    color: colors.brand.coral,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface[200],
    borderRadius: spacing.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.surface[400],
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  segmentTextActive: {
    color: colors.brand.violet,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.surface[300],
    borderWidth: 1,
    borderColor: colors.surface[400],
  },
  chipActive: {
    backgroundColor: colors.brand.violet,
    borderColor: colors.brand.violet,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  chipTextActive: {
    color: colors.text.primary,
  },
});
