import {
  TransactionBottomSheet,
  type TransactionBottomSheetHandle,
} from "@/components/TransactionBottomSheet";
import { TransactionGroup } from "@/components/transactions/TransactionGroup";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { FakerExpense } from "@/lib/util/faker";
import type { Expense } from "@/store/api/rtk/server/v1";
import { useCallback, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { ExpandableCalendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transactions() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);

  const [selectedTx, setSelectedTx] = useState<Expense | null>(null);

  const txModalRef = useRef<TransactionBottomSheetHandle>(null);
  const onPressTransaction = useCallback((tx: Expense) => {
    setSelectedTx(tx);
    txModalRef.current?.open();
  }, []);

  // TODO: Switch to use API call
  const txs: Expense[] = [
    FakerExpense,
    FakerExpense,
    FakerExpense,
    FakerExpense,
    FakerExpense,
  ];
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
      <ScrollView>
        <TransactionGroup
          txs={txs}
          onPress={onPressTransaction}
        />
        <TransactionGroup
          txs={txs}
          onPress={onPressTransaction}
        />
        <TransactionGroup
          txs={txs}
          onPress={onPressTransaction}
        />
        <TransactionGroup
          txs={txs}
          onPress={onPressTransaction}
        />
        <TransactionGroup
          txs={txs}
          onPress={onPressTransaction}
        />
      </ScrollView>
      <TransactionBottomSheet
        ref={txModalRef}
        tx={selectedTx}
        setTx={setSelectedTx}
      />
    </SafeAreaView>
  );
}
