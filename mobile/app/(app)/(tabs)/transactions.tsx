import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { StyleSheet, Text, View } from "react-native";
import { type MD3Theme, useTheme } from "react-native-paper";
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

const makeStyle = (theme: MD3Theme) =>
  StyleSheet.create({
    text: {
      color: theme.colors.primary,
      textDecorationLine: "underline",
    },
  });
