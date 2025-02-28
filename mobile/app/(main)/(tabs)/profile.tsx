import { useTheme } from "@/contexts/ThemeContext";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import type { Theme } from "@/style/theme";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const theme = useTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const styles = makeStyle(theme);
  return (
    <SafeAreaView style={gstyles.container}>
      <View>
        <Link
          href="/(main)/(tabs)/home"
          style={styles.button}
        >
          Go back to Home screen!
        </Link>
      </View>
    </SafeAreaView>
  );
}

const makeStyle = (theme: Theme) =>
  StyleSheet.create({
    button: {
      color: theme.color.text,
      textDecorationLine: "underline",
    },
  });
