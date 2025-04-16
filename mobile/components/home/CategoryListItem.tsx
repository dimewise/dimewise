import { useAppTheme } from "@/hooks/useAppTheme";
import { View } from "react-native";
import { ProgressBar, Text } from "react-native-paper";

export const CategoryListItem = () => {
  const theme = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        gap: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: theme.colors.backgroundMuted,
      }}
    >
      <View
        style={{
          padding: 4,
          backgroundColor: "red",
          height: 40,
          width: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>GR</Text>
      </View>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text variant="bodyMedium">Groceries</Text>
          <Text variant="bodyMedium">JPY 10,000/JPY 120,000</Text>
        </View>
        <ProgressBar
          animatedValue={0.5}
          style={{ borderRadius: 20, height: 8 }}
        />
      </View>
    </View>
  );
};
