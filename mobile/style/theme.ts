import { DefaultTheme } from "react-native-paper";

// Custom theme declaration for react-native-paper
// using MD3 default theme as base
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // brand colors
    primary: "#243454", // dark blue (logo stroke)
    secondary: "#08e699", // green (logo background)

    // background
    background: "#FAFAFA", // soft off-white background
    backgroundMuted: "#E0E0E0",

    // text
    text: "#000000",
    textMuted: "#A0A0A0",
  },
};

export type AppTheme = typeof theme;
