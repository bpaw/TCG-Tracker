/**
 * Divider Component (Atom)
 * Horizontal rule for visual separation
 */

import { View, ViewProps } from 'react-native';
import { styles as designStyles } from '../../design/styles';

export function Divider({ style, ...props }: ViewProps) {
  return <View style={[designStyles.divider, style]} {...props} />;
}
