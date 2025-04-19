import { TransactionGroup } from "@/components/transactions/TransactionGroup";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { ScrollView } from "react-native";
import { ExpandableCalendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transactions() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ExpandableCalendar
        hideKnob={false}
        allowShadow={false}
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          todayTextColor: theme.colors.secondary,
          selectedDayBackgroundColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
        }}
      />
      <ScrollView>
        <TransactionGroup />
        <TransactionGroup />
        <TransactionGroup />
        <TransactionGroup />
      </ScrollView>
    </SafeAreaView>
  );
}
