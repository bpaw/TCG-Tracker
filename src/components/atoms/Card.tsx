/**
 * Card Component (Atom)
 * Basic card container with consistent styling
 * Can be elevated for higher visual hierarchy
 */

import { View, ViewProps } from 'react-native';
import { styles as designStyles } from '../../design/styles';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated = false, style, ...props }: CardProps) {
  const baseStyle = elevated ? designStyles.cardElevated : designStyles.card;

  return <View style={[baseStyle, style]} {...props} />;
}
