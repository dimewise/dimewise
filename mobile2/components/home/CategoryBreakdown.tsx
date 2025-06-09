import {
  type CategoryFull,
  useApiV1CategoriesGetCategoriesQuery,
} from "@/store/api/rtk/server/v1";
import { DateTime } from "luxon";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { CategoryListItem } from "../CategoryListItem";

interface Props {
  onPress: (category: CategoryFull) => void;
}

export const CategoryBreakdown = ({ onPress }: Props) => {
  // api call
  const start = DateTime.now().startOf("month");
  const end = DateTime.now().endOf("month");
  const {
    data: categoriesData,
    isLoading: categoriesIsLoading,
    error: categoriesError,
  } = useApiV1CategoriesGetCategoriesQuery({
    fromDate: start.toISO(),
    toDate: end.toISO(),
  });

  // data display
  const categories = categoriesData ?? [];

  // handling state
  if (categoriesIsLoading || categoriesError) {
    return <></>;
  }

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
        {categories.length > 0 ? (
          categories?.map((c, i) => (
            <CategoryListItem
              key={c.id + i}
              category={c}
              showProgress
              onPress={onPress}
            />
          ))
        ) : (
          <Text>No categories available</Text>
        )}
      </View>
    </View>
  );
};
