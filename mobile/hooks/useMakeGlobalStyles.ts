import type { Theme } from "@/style/theme";
import { StyleSheet } from "react-native";

export const useMakeGlobalStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 30,
      height: "100%",
      backgroundColor: theme.color.background,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    safeAreaContainer: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
  });
