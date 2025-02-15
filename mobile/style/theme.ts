export const colors = {
  primary: "#263455", // dark blue (logo stroke)
  secondary: "#00ef98", // green (logo background)
  background: "#FAFAFA", // soft off-white background
  text: "#1e293b", // dark slate text for readability
  accent: "#64748b", // muted blue-gray accent for buttons or borders
  highlight: "#34d399", // vibrant green highlight (close to your secondary)
  border: "#e2e8f0", // light gray for subtle borders
  error: "#e11d48", // red for errors
  warning: "#facc15", // amber for warnings
  success: "#10b981", // teal for success
};

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 28,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 28,
  },
  borderRadius: 8,
};

export type Theme = typeof theme;
