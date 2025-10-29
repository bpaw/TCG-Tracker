/**
 * Card Component (Atom)
 * Basic card container with consistent styling
 * Can be elevated for higher visual hierarchy
 * Theme-aware for light/dark mode support
 */

import { View, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated = false, style, ...props }: CardProps) {
  const { styles } = useTheme();
  const baseStyle = elevated ? styles.cardElevated : styles.card;

  return <View style={[baseStyle, style]} {...props} />;
}
