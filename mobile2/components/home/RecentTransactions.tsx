import {
  type Expense,
  useApiV1ExpensesGetExpensesQuery,
} from "@/store/api/rtk/server/v1";
import { DateTime } from "luxon";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import { TransactionListItem } from "../TransactionListItem";

interface Props {
  onPress: (tx: Expense) => void;
}

export const RecentTransactions = ({ onPress }: Props) => {
  // api call
  const start = DateTime.now().startOf("month");
  const end = DateTime.now().endOf("month");
  const {
    data: txData,
    isLoading: txIsLoading,
    error: txError,
  } = useApiV1ExpensesGetExpensesQuery({
    fromDate: start.toISO(),
    toDate: end.toISO(),
    limit: 15,
  });

  // data display
  const txs = txData ?? [];

  // handle status
  if (txIsLoading || txError) {
    return <></>;
  }

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
          {txs.length > 0 ? (
            txs.map((tx, i) => (
              <TransactionListItem
                key={tx.id + i}
                captionType="created_at"
                tx={tx}
                onPress={onPress}
              />
            ))
          ) : (
            <Text>No recent transactions</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
