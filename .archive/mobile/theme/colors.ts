/**
 * Dimewise Color System - Receipt-Inspired Light Theme
 *
 * Design Philosophy:
 * - Clean, paper-white backgrounds like a receipt
 * - Monochromatic with strategic accent colors
 * - Whitespace and typography for visual hierarchy
 * - High contrast for accessibility
 */

export const colors = {
  // Primary - Emerald (growth/money) - used sparingly for CTAs
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

  // Neutral - The core of our monochromatic palette
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // Surfaces (light theme)
  surface: {
    base: '#FFFFFF', // Pure white - main background
    DEFAULT: '#FAFAFA', // Subtle off-white - cards
    elevated: '#FFFFFF', // White - elevated cards with shadow
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
  },

  // Text
  text: {
    primary: '#171717', // Near black - main text
    secondary: '#525252', // Dark gray - secondary text
    muted: '#737373', // Medium gray - tertiary/disabled
    inverse: '#FFFFFF', // White - on dark backgrounds
  },

  // Semantic
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue

  // Borders
  border: {
    DEFAULT: '#E5E5E5', // Light gray
    subtle: '#F5F5F5', // Very light
    strong: '#D4D4D4', // Darker border
  },

  // Accent (used very sparingly)
  accent: {
    DEFAULT: '#10B981',
  },

  // Legacy support (mapped to new light theme)
  background: '#FFFFFF',
  backgroundDefault: '#FFFFFF',
  backgroundSurface: '#FAFAFA',
  white: '#FFFFFF',
  black: '#171717',
  textPrimary: '#171717',
  textSecondary: '#525252',
  disabled: '#A3A3A3',

  // Legacy primary
  primaryLight: '#34D399',
  primaryDark: '#047857',
  primaryTextOn: '#FFFFFF',

  // Legacy secondary
  secondary: '#737373',
  secondaryLight: '#A3A3A3',
  secondaryDark: '#525252',
  secondaryTextOn: '#FFFFFF',

  // Legacy feedback
  errorTextOn: '#FFFFFF',
  successTextOn: '#FFFFFF',
  warningTextOn: '#171717',
} as const;

export type ColorKey = keyof typeof colors;
