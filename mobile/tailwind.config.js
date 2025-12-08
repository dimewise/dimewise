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
        // Primary - Emerald (used sparingly for CTAs and success states)
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
        // Neutral - Core monochromatic palette (receipt-inspired)
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
          DEFAULT: '#FAFAFA',
          base: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        // Semantic
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Background
        background: '#FFFFFF',
        // Border
        border: '#E5E5E5',
        'border-strong': '#D4D4D4',
        // Text utilities
        'text-primary': '#171717',
        'text-secondary': '#525252',
        'text-muted': '#737373',
      },
      fontFamily: {
        sans: ['System'],
        mono: ['Courier'],
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
