/**
 * Button Component (Atom)
 * Primary UI button with intent variants
 * Ensures ≥44dp touch targets for accessibility
 */

import { Pressable, Text, PressableProps } from 'react-native';
import { styles as designStyles } from '../../design/styles';

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
  const intentStyles = {
    primary: designStyles.btnPrimary,
    neutral: designStyles.btnNeutral,
    success: designStyles.btnSuccess,
    danger: designStyles.btnDanger,
  };

  return (
    <Pressable
      style={({ pressed }) => [
        designStyles.btnBase,
        intentStyles[intent],
        { opacity: pressed ? 0.9 : 1 },
        style,
      ]}
      {...rest}
    >
      <Text style={designStyles.btnText}>{title}</Text>
    </Pressable>
  );
}
