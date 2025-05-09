import { useAppTheme } from "@/hooks/useAppTheme";
import type { Expense } from "@/store/api/rtk/server/v1";
import { useLocales } from "expo-localization";
import { DateTime } from "luxon";
import { memo, useCallback, useMemo } from "react";
import { View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";

interface Props {
  captionType: "created_at" | "description";
  tx: Expense;
  onPress: (tx: Expense) => void;
}

export const TransactionListItem = memo(
  ({ captionType, tx, onPress }: Props) => {
    const theme = useAppTheme();
    const locale = useLocales();

    // datetime
    const userLocale = locale[0].languageTag;
    const displayDate = useMemo(() => {
      return tx
        ? DateTime.fromISO(tx.date)
            .setLocale(userLocale)
            .toLocaleString(DateTime.DATE_SHORT)
        : "";
    }, [tx.date, userLocale]);

    const handlePress = useCallback(() => onPress(tx), [onPress, tx]);
    return (
      <TouchableRipple
        style={{ flex: 1, minHeight: 50 }}
        onPress={handlePress}
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.tx.id === nextProps.tx.id &&
      prevProps.captionType === nextProps.captionType
    );
  },
);
