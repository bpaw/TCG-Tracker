/**
 * FormRow Component (Molecule)
 * Consistent form field layout with label and input
 * Supports error states and helper text
 */

import { View, ViewProps, StyleSheet } from 'react-native';
import { Body, Caption } from '../atoms/Text';
import { colors, spacing } from '../../design/tokens';

interface FormRowProps extends ViewProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}

const formRowStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm / 2,
  },
  required: {
    color: colors.brand.coral,
  },
  error: {
    color: colors.brand.coral,
    marginTop: 4,
  },
  helperText: {
    color: colors.text.muted,
    marginTop: 4,
  },
});

export function FormRow({
  label,
  error,
  helperText,
  required,
  children,
  style,
  ...rest
}: FormRowProps) {
  return (
    <View style={[formRowStyles.container, style]} {...rest}>
      <Body style={formRowStyles.label}>
        {label}
        {required && <Caption style={formRowStyles.required}> *</Caption>}
      </Body>

      {children}

      {error && <Caption style={formRowStyles.error}>{error}</Caption>}
      {!error && helperText && <Caption style={formRowStyles.helperText}>{helperText}</Caption>}
    </View>
  );
}
