import {
  TransactionBottomSheet,
  type TransactionBottomSheetHandle,
} from "@/components/TransactionBottomSheet";
import { TransactionListItem } from "@/components/TransactionListItem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import {
  getAgendaItemsFromTransactions,
  getMarkedDatesFromAgendaItems,
} from "@/lib/util/expense";
import {
  type Expense,
  useApiV1ExpensesGetExpensesQuery,
} from "@/store/api/rtk/server/v1";
import { useLocales } from "expo-localization";
import { DateTime } from "luxon";
import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { AgendaList, ExpandableCalendar } from "react-native-calendars";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transactions() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const locale = useLocales();
  const userLocale = locale[0].languageCode ?? locale[0].languageTag;

  const [selectedTx, setSelectedTx] = useState<Expense | null>(null);
  const [start, setStart] = useState(DateTime.now().startOf("month").toISO());
  const [end, setEnd] = useState(DateTime.now().endOf("month").toISO());
  const txModalRef = useRef<TransactionBottomSheetHandle>(null);

  // api call
  const {
    data: txData,
    isLoading: txIsLoading,
    error: txError,
  } = useApiV1ExpensesGetExpensesQuery({
    fromDate: start,
    toDate: end,
  });

  // data display
  const txs = txData ?? [];
  const dateBuckets = getAgendaItemsFromTransactions(txs);
  const markedDates = getMarkedDatesFromAgendaItems(dateBuckets);

  // handlers
  const onPressTransaction = useCallback((tx: Expense) => {
    setSelectedTx(tx);
    txModalRef.current?.open();
  }, []);

  const onPressArrow = useCallback((_: () => void, month: any) => {
    // TODO: revisit the month navigation, it might be giving the incorrect month
    const dtMonth = DateTime.fromISO(month.toISOString);

    const newStart = dtMonth.startOf("month").toISO();
    const newEnd = dtMonth.endOf("month").toISO();

    if (newStart && newEnd) {
      setStart(newStart);
      setEnd(newEnd);
    }
  }, []);

  // unfortunately the generic typings dont get carried over in typescript
  // "any" will suffice for now
  // sample info content:
  // {
  //   "item": {
  //     ...the data at the index, in this case the Expense[n]
  //   },
  //   "index": 1,
  //   "section": {
  //    ...the whole data set
  //   },
  //   "separators": {...not important}
  // }
  const renderAgendaItem = (info: any) => {
    return (
      <TransactionListItem
        captionType="description"
        tx={info.item}
        onPress={onPressTransaction}
      />
    );
  };

  const dayFormatter = (date: string) => {
    return DateTime.fromISO(date)
      .setLocale(userLocale)
      .toLocaleString(DateTime.DATE_FULL);
  };

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
        onPressArrowLeft={onPressArrow}
        onPressArrowRight={onPressArrow}
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          todayTextColor: theme.colors.secondary,
          selectedDayBackgroundColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
          dotColor: theme.colors.primary,
        }}
        markedDates={markedDates}
      />
      {dateBuckets.length > 0 ? (
        <AgendaList
          keyExtractor={(item) => item.id}
          sections={dateBuckets}
          renderItem={renderAgendaItem}
          dayFormatter={dayFormatter}
          markToday={false}
        />
      ) : (
        <View style={{ flex: 1, marginTop: 24 }}>
          <Text style={{ textAlign: "center" }}>
            No transactions made within this period
          </Text>
        </View>
      )}
      <TransactionBottomSheet
        ref={txModalRef}
        tx={selectedTx}
        setTx={setSelectedTx}
      />
    </SafeAreaView>
  );
}
