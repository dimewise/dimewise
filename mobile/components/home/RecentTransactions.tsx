import type { Expense } from "@/store/api/rtk/server/v1";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import { TransactionListItem } from "../TransactionListItem";

interface Props {
  onPress: (tx: Expense) => void;
  txs: Expense[];
}

export const RecentTransactions = ({ onPress, txs }: Props) => {
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
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1, gap: 8 }}>
          {txs.map((tx, i) => (
            <TransactionListItem
              key={tx.id + i}
              captionType="created_at"
              tx={tx}
              onPress={onPress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
