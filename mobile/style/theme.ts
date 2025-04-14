import { DefaultTheme } from "react-native-paper";

// Custom theme declaration for react-native-paper
// using MD3 default theme as base
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#263455", // dark blue (logo stroke)
    secondary: "#00ef98", // green (logo background)
    background: "#FAFAFA", // soft off-white background
  },
};
