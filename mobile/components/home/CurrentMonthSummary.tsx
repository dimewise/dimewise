import { useAppTheme } from "@/hooks/useAppTheme";
import { View } from "react-native";
import { ProgressBar, Text } from "react-native-paper";

export const CurrentMonthSummary = () => {
  const theme = useAppTheme();

  // TODO: add the necessary API calls and make the necessary calculations to display the progress bar
  // also ensure that the colors being shown are correct

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        paddingBottom: 0,
        gap: 24,
      }}
    >
      <Text
        variant="headlineMedium"
        style={{ fontWeight: "bold" }}
      >
        April 2025
      </Text>
      <View style={{ gap: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Text
            variant="headlineLarge"
            style={{ fontWeight: "bold" }}
          >
            JPY 120,000
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>/&nbsp;</Text>
            <Text style={{ fontWeight: "bold" }}>JPY 120,000</Text>
          </View>
        </View>
        <ProgressBar
          animatedValue={0.5}
          style={{ height: 12, borderRadius: 24 }}
        />
        <Text style={{ color: theme.colors.error }}>
          You have spent 10% of your monthly budget
        </Text>
      </View>
    </View>
  );
};
