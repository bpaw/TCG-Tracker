import { useMemo } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { getThemeColors, spacing, radius, typography, shadows } from '../design/tokens';
import { createStyles } from '../design/styles';

/**
 * Custom hook to access theme-aware colors, styles, and design tokens
 * @returns Theme colors, styles, spacing, radius, typography, shadows, and isDark state
 */
export function useTheme() {
  const isDark = useThemeStore((state) => state.isDark);

  const colors = useMemo(() => getThemeColors(isDark), [isDark]);
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return {
    colors,
    styles,
    spacing,
    radius,
    typography,
    shadows,
    isDark,
  };
}
