import {
  TransactionBottomSheet,
  type TransactionBottomSheetHandle,
} from "@/components/TransactionBottomSheet";
import { TransactionGroup } from "@/components/transactions/TransactionGroup";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { bucketAndSortExpenses } from "@/lib/util/expense";
import {
  type Expense,
  useApiV1ExpensesGetExpensesQuery,
} from "@/store/api/rtk/server/v1";
import { useLocales } from "expo-localization";
import { DateTime } from "luxon";
import { useCallback, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { ExpandableCalendar } from "react-native-calendars";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transactions() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const locale = useLocales();
  const userLocale = locale[0].languageCode ?? locale[0].languageTag;

  const [selectedTx, setSelectedTx] = useState<Expense | null>(null);
  const txModalRef = useRef<TransactionBottomSheetHandle>(null);

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
  });

  // data display
  const txes = txData ?? [];
  const dateBuckets = bucketAndSortExpenses(userLocale, txes);

  // handlers
  const onPressTransaction = useCallback((tx: Expense) => {
    setSelectedTx(tx);
    txModalRef.current?.open();
  }, []);

  // handle state
  if (txIsLoading || txError) {
    return <></>;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ExpandableCalendar
        hideKnob={false}
        allowShadow={false}
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          todayTextColor: theme.colors.secondary,
          selectedDayBackgroundColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        {txes.length > 0 ? (
          Object.entries(dateBuckets).map(([date, txs]) => (
            <TransactionGroup
              groupTitle={date}
              txs={txs}
              onPress={onPressTransaction}
            />
          ))
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: "center", marginTop: 24 }}>
              No transactions found for this period
            </Text>
          </View>
        )}
      </ScrollView>
      <TransactionBottomSheet
        ref={txModalRef}
        tx={selectedTx}
        setTx={setSelectedTx}
      />
    </SafeAreaView>
  );
}
