/**
 * Button Component (Atom)
 * Primary UI button with intent variants
 * Ensures ≥44dp touch targets for accessibility
 * Theme-aware for light/dark mode support
 */

import { Pressable, Text, PressableProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type ButtonIntent = 'primary' | 'neutral' | 'success' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  intent?: ButtonIntent;
}

export function Button({
  title,
  intent = 'primary',
  style,
  ...rest
}: ButtonProps) {
  const { styles } = useTheme();

  const intentStyles = {
    primary: styles.btnPrimary,
    neutral: styles.btnNeutral,
    success: styles.btnSuccess,
    danger: styles.btnDanger,
  };

  const textStyle = intent === 'neutral' ? styles.btnTextNeutral : styles.btnText;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btnBase,
        intentStyles[intent],
        { opacity: pressed ? 0.9 : 1 },
        style,
      ]}
      {...rest}
    >
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}
