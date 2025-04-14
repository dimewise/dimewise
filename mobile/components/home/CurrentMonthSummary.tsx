import { StyleSheet, Text, View } from "react-native";
import { type MD3Theme, useTheme } from "react-native-paper";

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

const makeStyle = (theme: MD3Theme) =>
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
      fontFamily: theme.fonts.headlineLarge.fontFamily,
      fontSize: theme.fonts.headlineLarge.fontSize,
    },
    budgetUsedText: {
      fontFamily: theme.fonts.headlineLarge.fontFamily,
      fontSize: theme.fonts.headlineLarge.fontSize,
    },
    totalBudgetText: {
      fontFamily: theme.fonts.headlineLarge.fontFamily,
      fontSize: theme.fonts.headlineLarge.fontSize,
    },
    totalBudgetContainer: {
      display: "flex",
      flexDirection: "row",
      marginBottom: 15,
    },
  });
