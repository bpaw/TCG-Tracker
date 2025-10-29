/**
 * KPI Component (Molecule)
 * Key Performance Indicator card
 * Displays a metric with optional delta/trend information or subtitle
 * Uses mono font for numbers to prevent layout jump
 */

import { View, ViewProps, StyleSheet } from 'react-native';
import { Caption, MonoText } from '../atoms/Text';
import { styles as designStyles } from '../../design/styles';
import { colors, typography } from '../../design/tokens';

interface KPIProps extends ViewProps {
  label: string;
  value: string | number;
  delta?: string;
  subtitle?: string;
}

const kpiStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.semibold,
  },
  value: {
    fontSize: typography.fontSize['2xl'],
    marginTop: 4,
    fontWeight: typography.fontWeight.bold,
  },
  delta: {
    color: colors.brand.amber,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
});

export function KPI({ label, value, delta, subtitle, style, ...rest }: KPIProps) {
  return (
    <View style={[designStyles.card, kpiStyles.container, style]} {...rest}>
      <Caption style={kpiStyles.label}>{label}</Caption>
      <MonoText style={kpiStyles.value}>{value}</MonoText>
      {delta && <Caption style={kpiStyles.delta}>{delta}</Caption>}
      {subtitle && !delta && <Caption style={kpiStyles.subtitle}>{subtitle}</Caption>}
    </View>
  );
}
