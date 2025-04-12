import { useTheme } from "@/contexts/ThemeContext";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import type { Theme } from "@/style/theme";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transactions() {
  const theme = useTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const styles = makeStyle(theme);
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <View style={gstyles.container}>
        <Text style={styles.text}>About Screen</Text>
      </View>
    </SafeAreaView>
  );
}

const makeStyle = (theme: Theme) =>
  StyleSheet.create({
    text: {
      color: theme.color.text,
      textDecorationLine: "underline",
    },
  });
