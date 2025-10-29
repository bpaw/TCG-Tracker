/**
 * FormRow Component (Molecule)
 * Consistent form field layout with label and input
 * Supports error states and helper text
 */

import { View, ViewProps } from 'react-native';
import { Body, Caption } from '../atoms/Text';
import { useTheme } from '../../hooks/useTheme';

interface FormRowProps extends ViewProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormRow({
  label,
  error,
  helperText,
  required,
  children,
  style,
  ...rest
}: FormRowProps) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[{ marginBottom: spacing.md }, style]} {...rest}>
      <Body style={{ marginBottom: spacing.sm / 2 }}>
        {label}
        {required && <Caption style={{ color: colors.brand.coral }}> *</Caption>}
      </Body>

      {children}

      {error && <Caption style={{ color: colors.brand.coral, marginTop: 4 }}>{error}</Caption>}
      {!error && helperText && <Caption style={{ color: colors.text.muted, marginTop: 4 }}>{helperText}</Caption>}
    </View>
  );
}
