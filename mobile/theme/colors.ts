/**
 * Dimewise Color System
 *
 * Use Tailwind classes when possible. This file is for:
 * - JavaScript color references (charts, dynamic styles)
 * - Third-party component styling
 */

export const colors = {
  // Primary - Emerald (growth/money)
  primary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    DEFAULT: '#10B981',
  },

  // Accent - Amber
  accent: {
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    DEFAULT: '#F59E0B',
  },

  // Surfaces (dark theme)
  surface: {
    base: '#09090B', // zinc-950 - Main background
    DEFAULT: '#18181B', // zinc-900 - Cards
    elevated: '#27272A', // zinc-800 - Elevated cards
    overlay: '#3F3F46', // zinc-700 - Overlays
  },

  // Text
  text: {
    primary: '#FAFAFA', // zinc-50
    secondary: '#A1A1AA', // zinc-400
    muted: '#71717A', // zinc-500
    inverse: '#09090B', // zinc-950
  },

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders
  border: {
    DEFAULT: '#27272A', // zinc-800
    subtle: '#3F3F46', // zinc-700
  },

  // Legacy support (map to new colors for backward compatibility)
  background: '#09090B',
  backgroundDefault: '#09090B',
  backgroundSurface: '#18181B',
  white: '#FAFAFA',
  black: '#09090B',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  disabled: '#71717A',

  // Legacy primary colors (mapped to new system)
  primaryLight: '#34D399',
  primaryDark: '#047857',
  primaryTextOn: '#09090B',

  // Legacy secondary (mapped to accent)
  secondary: '#F59E0B',
  secondaryLight: '#FBBF24',
  secondaryDark: '#D97706',
  secondaryTextOn: '#09090B',

  // Legacy feedback
  errorTextOn: '#FAFAFA',
  successTextOn: '#FAFAFA',
  warningTextOn: '#09090B',
} as const;

export type ColorKey = keyof typeof colors;
