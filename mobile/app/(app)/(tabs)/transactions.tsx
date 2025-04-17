import { TransactionListItem } from "@/components/home/TransactionListItem";
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
      <ExpandableCalendar />
      <ScrollView>
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
      </ScrollView>
    </SafeAreaView>
  );
}
