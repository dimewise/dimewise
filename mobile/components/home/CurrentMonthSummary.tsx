import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/style/theme";
import { StyleSheet, Text, View } from "react-native";

export const CurrentMonthSummary = () => {
  const theme = useTheme();
  const styles = makeStyle(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.currentMonthText}>April</Text>
      <View style={styles.currentMonthSummaryContainer}>
        <Text style={styles.budgetUsedText}>JPY 120,000</Text>
        <View style={styles.totalBudgetContainer}>
          <Text style={styles.totalBudgetText}>/&nbsp;</Text>
          <Text style={styles.totalBudgetText}>JPY 120,000</Text>
        </View>
        <View />
      </View>
    </View>
  );
};

const makeStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      padding: 24,
    },
    currentMonthSummaryContainer: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    currentMonthText: {
      fontFamily: theme.typography.black,
      fontSize: theme.fontSizes.xl,
    },
    budgetUsedText: {
      fontFamily: theme.typography.bold,
      fontSize: theme.fontSizes.xxl,
    },
    totalBudgetText: {
      fontFamily: theme.typography.regular,
      fontSize: theme.fontSizes.sm,
    },
    totalBudgetContainer: {
      display: "flex",
      flexDirection: "row",
      marginBottom: 15,
    },
  });
