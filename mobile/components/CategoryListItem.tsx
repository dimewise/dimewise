import { useAppTheme } from "@/hooks/useAppTheme";
import type { CategoryFull } from "@/store/api/rtk/server/v1";
import { View } from "react-native";
import { ProgressBar, Text, TouchableRipple } from "react-native-paper";

interface Props {
  category: CategoryFull;
  showProgress?: boolean;
  onPress: (category: CategoryFull) => void;
}

export const CategoryListItem = ({
  category,
  showProgress,
  onPress,
}: Props) => {
  const theme = useAppTheme();
  const progressValue = category.spent / category.budget;

  return (
    <TouchableRipple
      style={{ flex: 1 }}
      onPress={() => onPress(category)}
    >
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
        <View style={{ flex: 1, gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="bodyMedium">{category.name}</Text>
            {showProgress ? (
              <Text variant="bodyMedium">
                {`JPY ${category.spent}/ JPY ${category.budget}`}
              </Text>
            ) : (
              <Text variant="bodyMedium">{`JPY ${category.budget}`}</Text>
            )}
          </View>
          {showProgress && (
            <ProgressBar
              animatedValue={progressValue}
              style={{ borderRadius: 20, height: 8 }}
            />
          )}
        </View>
      </View>
    </TouchableRipple>
  );
};
