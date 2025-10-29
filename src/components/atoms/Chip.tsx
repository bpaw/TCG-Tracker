/**
 * Chip Component (Atom)
 * Status indicator with color-coded variants
 * Uses both color and text for accessibility (non-color cues)
 */

import { Text, View, ViewProps } from 'react-native';
import { styles as designStyles } from '../../design/styles';

type ChipKind = 'win' | 'loss' | 'meta';

interface ChipProps extends Omit<ViewProps, 'children'> {
  kind: ChipKind;
  text: string;
}

export function Chip({ kind, text, style, ...rest }: ChipProps) {
  const kindStyles = {
    win: { container: designStyles.chipWin, text: designStyles.chipWinText },
    loss: { container: designStyles.chipLoss, text: designStyles.chipLossText },
    meta: { container: designStyles.chipMeta, text: designStyles.chipMetaText },
  };

  const styles = kindStyles[kind];

  return (
    <View style={[designStyles.chipBase, styles.container, style]} {...rest}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
