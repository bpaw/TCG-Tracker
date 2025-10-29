/**
 * ListItem Component (Molecule)
 * Reusable list item with consistent spacing and hit targets
 * Ensures ≥44dp touch target for accessibility
 */

import { Pressable, View, PressableProps } from 'react-native';
import { Body, Caption } from '../atoms/Text';
import { useTheme } from '../../hooks/useTheme';

interface ListItemProps extends Omit<PressableProps, 'children'> {
  title: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function ListItem({
  title,
  subtitle,
  leftElement,
  rightElement,
  style,
  ...rest
}: ListItemProps) {
  const { spacing } = useTheme();
  return (
    <Pressable style={[{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minHeight: 44,
    }, style]} {...rest}>
      {leftElement && <View style={{ marginRight: spacing.sm }}>{leftElement}</View>}

      <View style={{ flex: 1 }}>
        <Body>{title}</Body>
        {subtitle && <Caption style={{ marginTop: 2 }}>{subtitle}</Caption>}
      </View>

      {rightElement && <View style={{ marginLeft: spacing.sm }}>{rightElement}</View>}
    </Pressable>
  );
}
