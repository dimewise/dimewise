/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
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
        // Surfaces
        surface: {
          DEFAULT: '#18181B', // zinc-900
          base: '#09090B', // zinc-950
          elevated: '#27272A', // zinc-800
          overlay: '#3F3F46', // zinc-700
        },
        // Semantic
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Background
        background: '#09090B',
        // Border
        border: '#27272A',
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
      borderRadius: {
        '4xl': '32px',
      },
      spacing: {
        '18': '72px',
        '88': '352px',
      },
    },
  },
  plugins: [],
};
