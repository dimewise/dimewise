import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transactions() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <View style={gstyles.container}>
        <Text
          style={{
            color: theme.colors.primary,
            textDecorationLine: "underline",
          }}
        >
          About Screen
        </Text>
      </View>
    </SafeAreaView>
  );
}
