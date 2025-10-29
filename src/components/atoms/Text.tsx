/**
 * Text Components (Atoms)
 * Typography hierarchy with consistent styling
 * Respects dynamic type for accessibility
 * Theme-aware for light/dark mode support
 */

import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * Title - Largest heading, used for screen titles
 */
export function Title({ style, ...props }: RNTextProps) {
  const { styles } = useTheme();
  return <RNText style={[styles.title, style]} {...props} />;
}

/**
 * H1 - Primary heading
 */
export function H1({ style, ...props }: RNTextProps) {
  const { styles } = useTheme();
  return <RNText style={[styles.h1, style]} {...props} />;
}

/**
 * H2 - Secondary heading
 */
export function H2({ style, ...props }: RNTextProps) {
  const { styles } = useTheme();
  return <RNText style={[styles.h2, style]} {...props} />;
}

/**
 * Body - Standard body text
 */
export function Body({ style, ...props }: RNTextProps) {
  const { styles } = useTheme();
  return <RNText style={[styles.body, style]} {...props} />;
}

/**
 * Caption - Small text for metadata
 */
export function Caption({ style, ...props }: RNTextProps) {
  const { styles } = useTheme();
  return <RNText style={[styles.caption, style]} {...props} />;
}

/**
 * MonoText - For numbers and code
 */
export function MonoText({ style, ...props }: RNTextProps) {
  const { styles } = useTheme();
  return <RNText style={[styles.body, { fontFamily: 'Menlo' }, style]} {...props} />;
}
