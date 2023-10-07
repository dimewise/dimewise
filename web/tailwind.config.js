/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  me: {
    extend: {},
  },
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      background: "#2C3333",
      foreground: "#395B64",
      primary: "#A5C9CA",
      secondary: "#E7F6F2",
    },
    fontFamily: {
      go: ["go", "sans-serif"],
    },
  },
  plugins: [],
};
