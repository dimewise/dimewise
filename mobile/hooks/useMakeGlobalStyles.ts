import type { AppTheme } from "@/style/theme";
import { StyleSheet } from "react-native";

export const useMakeGlobalStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
