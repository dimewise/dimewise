import { FakerExpense } from "@/lib/util/faker";
import type { Expense } from "@/store/api/rtk/server/v1";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { TransactionListItem } from "../TransactionListItem";

interface Props {
  onPress: (tx: Expense) => void;
}

export const RecentTransactions = ({ onPress }: Props) => {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        gap: 16,
      }}
    >
      <Text
        variant="titleMedium"
        style={{ fontWeight: "bold" }}
      >
        Recent Transactions
      </Text>
      <View style={{ gap: 8 }}>
        <TransactionListItem
          captionType="created_at"
          tx={FakerExpense}
          onPress={onPress}
        />
        <TransactionListItem
          captionType="created_at"
          tx={FakerExpense}
          onPress={onPress}
        />
        <TransactionListItem
          captionType="created_at"
          tx={FakerExpense}
          onPress={onPress}
        />
        <TransactionListItem
          captionType="created_at"
          tx={FakerExpense}
          onPress={onPress}
        />
        <TransactionListItem
          captionType="created_at"
          tx={FakerExpense}
          onPress={onPress}
        />
      </View>
    </View>
  );
};
