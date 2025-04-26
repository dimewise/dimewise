import {
  CategoryBottomSheet,
  type CategoryBottomSheetHandle,
} from "@/components/CategoryBottomSheet";
import { CategoryListItem } from "@/components/CategoryListItem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { FakerCategoryFull } from "@/lib/util/faker";
import type { CategoryFull } from "@/store/api/rtk/server/v1";
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

  const categories: CategoryFull[] = [
    FakerCategoryFull,
    FakerCategoryFull,
    FakerCategoryFull,
    FakerCategoryFull,
    FakerCategoryFull,
    FakerCategoryFull,
  ];

  const categoryModalRef = useRef<CategoryBottomSheetHandle>(null);
  const onPressCategory = useCallback((category: CategoryFull) => {
    setSelectedCategory(category);
    categoryModalRef.current?.open();
  }, []);

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
            {categories.map((c, i) => (
              <CategoryListItem
                key={c.id + i}
                category={c}
                showProgress
                onPress={onPressCategory}
              />
            ))}
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
