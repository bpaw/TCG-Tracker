/**
 * Design Tokens
 * Source of truth for colors, spacing, typography, and other design values
 * Based on Gamer Energy theme (dark-first)
 */

export const colors = {
  brand: {
    violet: '#7C4DFF',    // Electric violet (primary)
    charcoal: '#121826',  // Background / canvas
    emerald: '#4ADE80',   // Success / Win
    coral: '#F87171',     // Error / Loss
    amber: '#FBBF24',     // Highlight / Meta
  },
  surface: {
    0: '#0D1117',   // deep canvas (rare)
    100: '#121826', // main app background (charcoal)
    200: '#1A2131', // section bg
    300: '#222A3D', // cards
    400: '#2C354D', // elevated cards / headers
  },
  text: {
    primary: '#E2E8F0',   // grayd-200
    secondary: '#94A3B8', // grayd-400
    muted: '#64748B',     // grayd-500
  },
  grayd: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1F2937',
    900: '#0B1220',
  },
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 20,
};

export const typography = {
  fontFamily: {
    sans: 'System',
    display: 'System',
    mono: 'Menlo',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  lineHeight: {
    xs: 18,
    sm: 20,
    base: 24,
    lg: 26,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
};
