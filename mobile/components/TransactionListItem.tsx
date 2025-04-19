import { useAppTheme } from "@/hooks/useAppTheme";
import { View } from "react-native";
import { Text } from "react-native-paper";

interface Props {
  captionType: "created_at" | "description";
}

export const TransactionListItem = ({ captionType }: Props) => {
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
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              variant="bodyMedium"
              style={{ fontWeight: "bold" }}
            >
              Groceries
            </Text>
            {captionType === "created_at" && (
              <Text variant="bodySmall">12/04/2025</Text>
            )}
            {captionType === "description" && (
              <Text
                variant="bodySmall"
                numberOfLines={1}
              >
                Bought weekly groceries like so Bought weekly groceries like so
                Bought weekly groceries like so Bought weekly groceries like so
                Bought weekly groceries like so Bought weekly groceries like so
                Bought weekly groceries like so Bought weekly groceries like so
                Bought weekly groceries like so
              </Text>
            )}
          </View>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.error }}
          >
            - JPY 120,000
          </Text>
        </View>
      </View>
    </View>
  );
};
