import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";

export const useMakeGlobalStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 30,
      height: "100%",
      backgroundColor: theme.colors.background,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    safeAreaContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
