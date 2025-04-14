import { CurrentMonthSummary } from "@/components/home/CurrentMonthSummary";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const theme = useTheme();
  const gstyles = useMakeGlobalStyles(theme);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ScrollView>
        <CurrentMonthSummary />
      </ScrollView>
    </SafeAreaView>
  );
}
