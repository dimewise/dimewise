import type { Expense } from "@/store/api/rtk/server/v1";
import { View } from "react-native";
import { Divider, Text } from "react-native-paper";
import { TransactionListItem } from "../TransactionListItem";

interface Props {
  groupTitle: string;
  onPress: (tx: Expense) => void;
  txs: Expense[];
}

export const TransactionGroup = ({ groupTitle, txs, onPress }: Props) => {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        gap: 16,
      }}
    >
      <View style={{ gap: 8 }}>
        <Text variant="bodyMedium">{groupTitle}</Text>
        <Divider />
      </View>
      <View style={{ gap: 8 }}>
        {txs.map((tx, i) => (
          <TransactionListItem
            key={tx.id + i}
            captionType="description"
            tx={tx}
            onPress={onPress}
          />
        ))}
      </View>
    </View>
  );
};
