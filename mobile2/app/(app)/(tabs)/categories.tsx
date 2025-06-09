import {
  CategoryBottomSheet,
  type CategoryBottomSheetHandle,
} from "@/components/CategoryBottomSheet";
import { CategoryListItem } from "@/components/CategoryListItem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import {
  type CategoryFull,
  useApiV1CategoriesGetCategoriesQuery,
} from "@/store/api/rtk/server/v1";
import { DateTime } from "luxon";
import { useCallback, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Categories() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);

  const [selectedCategory, setSelectedCategory] = useState<CategoryFull | null>(
    null,
  );

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
  const totalBudget = categories.reduce(
    (sum, category) => sum + category.budget,
    0,
  );

  // bottom sheet
  const categoryModalRef = useRef<CategoryBottomSheetHandle>(null);
  const onPressCategory = useCallback((category: CategoryFull) => {
    setSelectedCategory(category);
    categoryModalRef.current?.open();
  }, []);

  // handling state
  if (categoriesIsLoading || categoriesError) {
    return <></>;
  }

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
          <Text variant="headlineLarge">{`JPY ${totalBudget}`}</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ flex: 1, gap: 8, paddingBottom: 24 }}>
            {categories.length > 0 ? (
              categories?.map((c, i) => (
                <CategoryListItem
                  key={c.id + i}
                  category={c}
                  showProgress
                  onPress={onPressCategory}
                />
              ))
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text>No categories available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      <CategoryBottomSheet
        ref={categoryModalRef}
        category={selectedCategory}
        setCategory={setSelectedCategory}
      />
    </SafeAreaView>
  );
}
