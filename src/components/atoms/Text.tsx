/**
 * Text Components (Atoms)
 * Typography hierarchy with consistent styling
 * Respects dynamic type for accessibility
 */

import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { styles as designStyles } from '../../design/styles';

/**
 * Title - Largest heading, used for screen titles
 */
export function Title({ style, ...props }: RNTextProps) {
  return <RNText style={[designStyles.title, style]} {...props} />;
}

/**
 * H1 - Primary heading
 */
export function H1({ style, ...props }: RNTextProps) {
  return <RNText style={[designStyles.h1, style]} {...props} />;
}

/**
 * H2 - Secondary heading
 */
export function H2({ style, ...props }: RNTextProps) {
  return <RNText style={[designStyles.h2, style]} {...props} />;
}

/**
 * Body - Standard body text
 */
export function Body({ style, ...props }: RNTextProps) {
  return <RNText style={[designStyles.body, style]} {...props} />;
}

/**
 * Caption - Small text for metadata
 */
export function Caption({ style, ...props }: RNTextProps) {
  return <RNText style={[designStyles.caption, style]} {...props} />;
}

/**
 * MonoText - For numbers and code
 */
export function MonoText({ style, ...props }: RNTextProps) {
  return <RNText style={[designStyles.body, { fontFamily: 'Menlo' }, style]} {...props} />;
}
