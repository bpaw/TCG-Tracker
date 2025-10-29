/**
 * ListItem Component (Molecule)
 * Reusable list item with consistent spacing and hit targets
 * Ensures ≥44dp touch target for accessibility
 */

import { Pressable, View, PressableProps, StyleSheet } from 'react-native';
import { Body, Caption } from '../atoms/Text';
import { spacing } from '../../design/tokens';

interface ListItemProps extends Omit<PressableProps, 'children'> {
  title: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const listItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  leftElement: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  rightElement: {
    marginLeft: spacing.sm,
  },
});

export function ListItem({
  title,
  subtitle,
  leftElement,
  rightElement,
  style,
  ...rest
}: ListItemProps) {
  return (
    <Pressable style={[listItemStyles.container, style]} {...rest}>
      {leftElement && <View style={listItemStyles.leftElement}>{leftElement}</View>}

      <View style={listItemStyles.content}>
        <Body>{title}</Body>
        {subtitle && <Caption style={listItemStyles.subtitle}>{subtitle}</Caption>}
      </View>

      {rightElement && <View style={listItemStyles.rightElement}>{rightElement}</View>}
    </Pressable>
  );
}
