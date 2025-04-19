import { View } from "react-native";
import { Text } from "react-native-paper";
import { CategoryListItem } from "../CategoryListItem";

export const CategoryBreakdown = () => {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        paddingBottom: 0,
        gap: 16,
      }}
    >
      <Text
        variant="titleMedium"
        style={{ fontWeight: "bold" }}
      >
        Category Overview
      </Text>
      <View style={{ gap: 8 }}>
        <CategoryListItem showProgress />
        <CategoryListItem showProgress />
        <CategoryListItem showProgress />
        <CategoryListItem showProgress />
        <CategoryListItem showProgress />
      </View>
    </View>
  );
};
