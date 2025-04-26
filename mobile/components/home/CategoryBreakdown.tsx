import type { CategoryFull } from "@/store/api/rtk/server/v1";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { CategoryListItem } from "../CategoryListItem";

interface Props {
  categories: CategoryFull[];
  onPress: (category: CategoryFull) => void;
}

export const CategoryBreakdown = ({ categories, onPress }: Props) => {
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
        {categories.map((c, i) => (
          <CategoryListItem
            key={c.id + i}
            category={c}
            showProgress
            onPress={onPress}
          />
        ))}
      </View>
    </View>
  );
};
