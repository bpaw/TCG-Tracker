/**
 * Divider Component (Atom)
 * Horizontal rule for visual separation
 * Theme-aware for light/dark mode support
 */

import { View, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export function Divider({ style, ...props }: ViewProps) {
  const { styles } = useTheme();
  return <View style={[styles.divider, style]} {...props} />;
}
