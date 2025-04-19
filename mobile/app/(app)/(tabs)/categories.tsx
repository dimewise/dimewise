import { CategoryListItem } from "@/components/CategoryListItem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Categories() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <View style={{ flex: 1, margin: 24, marginBottom: 0 }}>
        <View
          style={{
            flex: 0,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginVertical: 40,
          }}
        >
          <Text variant="titleMedium">Total Monthly Budget</Text>
          <Text variant="headlineLarge">JPY 120,000</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ gap: 8, paddingBottom: 24 }}>
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
            <CategoryListItem />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
