import { View } from "react-native";
import { Text } from "react-native-paper";
import { TransactionListItem } from "../TransactionListItem";

export const RecentTransactions = () => {
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
        <TransactionListItem captionType="created_at" />
        <TransactionListItem captionType="created_at" />
        <TransactionListItem captionType="created_at" />
        <TransactionListItem captionType="created_at" />
        <TransactionListItem captionType="created_at" />
        <TransactionListItem captionType="created_at" />
      </View>
    </View>
  );
};
