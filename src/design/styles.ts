/**
 * Semantic Style Recipes
 * Pre-composed StyleSheet objects for consistent styling across the app
 * Based on Gamer Energy theme (dark-first)
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadows } from './tokens';

export const styles = StyleSheet.create({
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: colors.surface[100],
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  // Cards
  card: {
    backgroundColor: colors.surface[300],
    borderRadius: radius['2xl'],
    padding: spacing.md,
    ...shadows.card,
  },
  cardElevated: {
    backgroundColor: colors.surface[400],
    borderRadius: radius['2xl'],
    padding: spacing.md,
    ...shadows.card,
  },

  // Text styles
  textPrimary: {
    color: colors.text.primary,
  },
  textSecondary: {
    color: colors.text.secondary,
  },
  textMuted: {
    color: colors.text.muted,
  },

  // Typography
  title: {
    fontSize: typography.fontSize['2xl'],
    lineHeight: typography.lineHeight['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  h1: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  h2: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: colors.text.primary,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.text.secondary,
  },

  // Buttons
  btnBase: {
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Touch target accessibility
  },
  btnPrimary: {
    backgroundColor: colors.brand.violet,
  },
  btnNeutral: {
    backgroundColor: colors.surface[400],
  },
  btnSuccess: {
    backgroundColor: colors.brand.emerald,
  },
  btnDanger: {
    backgroundColor: colors.brand.coral,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },

  // Chips / Status indicators
  chipBase: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xl,
  },
  chipWin: {
    backgroundColor: `${colors.brand.emerald}33`, // 20% opacity
  },
  chipWinText: {
    color: colors.brand.emerald,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  chipLoss: {
    backgroundColor: `${colors.brand.coral}33`, // 20% opacity
  },
  chipLossText: {
    color: colors.brand.coral,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  chipMeta: {
    backgroundColor: `${colors.brand.amber}33`, // 20% opacity
  },
  chipMetaText: {
    color: colors.brand.amber,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  col: {
    flexDirection: 'column',
  },
  divider: {
    height: 1,
    backgroundColor: `${colors.surface[400]}66`, // 40% opacity
    marginVertical: spacing.sm,
  },
});
