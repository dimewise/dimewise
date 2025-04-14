import { CurrentMonthSummary } from "@/components/home/CurrentMonthSummary";
import { useTheme } from "@/contexts/ThemeContext";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import type { Theme } from "@/style/theme";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const theme = useTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const styles = makeStyle(theme);

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

const makeStyle = (_: Theme) => StyleSheet.create({});
