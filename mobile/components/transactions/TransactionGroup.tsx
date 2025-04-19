import { View } from "react-native";
import { Divider, Text } from "react-native-paper";
import { TransactionListItem } from "../TransactionListItem";

export const TransactionGroup = () => {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        gap: 16,
      }}
    >
      <View style={{ gap: 8 }}>
        <Text variant="bodyMedium">3 April 2025</Text>
        <Divider />
      </View>
      <View style={{ gap: 8 }}>
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
        <TransactionListItem />
      </View>
    </View>
  );
};
