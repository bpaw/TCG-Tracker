/**
 * KPI Component (Molecule)
 * Key Performance Indicator card
 * Displays a metric with optional delta/trend information or subtitle
 * Uses mono font for numbers to prevent layout jump
 */

import { View, ViewProps } from 'react-native';
import { Caption, MonoText } from '../atoms/Text';
import { useTheme } from '../../hooks/useTheme';

interface KPIProps extends ViewProps {
  label: string;
  value: string | number;
  delta?: string;
  subtitle?: string;
}

export function KPI({ label, value, delta, subtitle, style, ...rest }: KPIProps) {
  const { colors, typography, styles } = useTheme();
  return (
    <View style={[styles.card, { flex: 1 }, style]} {...rest}>
      <Caption style={{
        fontSize: typography.fontSize.xs,
        textTransform: 'uppercase',
        fontWeight: typography.fontWeight.semibold,
      }}>{label}</Caption>
      <MonoText style={{
        fontSize: typography.fontSize['2xl'],
        marginTop: 4,
        fontWeight: typography.fontWeight.bold,
      }}>{value}</MonoText>
      {delta && <Caption style={{
        color: colors.brand.amber,
        fontSize: typography.fontSize.xs,
        marginTop: 2,
      }}>{delta}</Caption>}
      {subtitle && !delta && <Caption style={{
        fontSize: typography.fontSize.xs,
        marginTop: 2,
      }}>{subtitle}</Caption>}
    </View>
  );
}
