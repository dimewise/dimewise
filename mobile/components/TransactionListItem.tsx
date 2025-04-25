import { useAppTheme } from "@/hooks/useAppTheme";
import type { Expense } from "@/store/api/rtk/server/v1";
import { useLocales } from "expo-localization";
import { DateTime } from "luxon";
import { View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";

interface Props {
  captionType: "created_at" | "description";
  tx: Expense;
  onPress: (tx: Expense) => void;
}

export const TransactionListItem = ({ captionType, tx, onPress }: Props) => {
  const theme = useAppTheme();
  const locale = useLocales();

  // datetime
  const userLocale = locale[0].languageTag;
  const displayDate = tx
    ? DateTime.fromISO(tx.date)
        .setLocale(userLocale)
        .toLocaleString(DateTime.DATE_SHORT)
    : "";

  return (
    <TouchableRipple onPress={() => onPress(tx)}>
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
                {tx.title}
              </Text>
              {captionType === "created_at" && (
                <Text variant="bodySmall">{displayDate}</Text>
              )}
              {captionType === "description" && tx.description && (
                <Text
                  variant="bodySmall"
                  numberOfLines={1}
                >
                  {tx.description}
                </Text>
              )}
            </View>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.error }}
            >
              {"- JPY" + tx.amount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableRipple>
  );
};
