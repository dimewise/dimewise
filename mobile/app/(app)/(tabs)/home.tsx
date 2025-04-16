import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { CurrentMonthSummary } from "@/components/home/CurrentMonthSummary";
import { RecentTransactions } from "@/components/home/RecentTransactions";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ScrollView>
        <CurrentMonthSummary />
        <CategoryBreakdown />
        <RecentTransactions />
      </ScrollView>
    </SafeAreaView>
  );
}
