import {
  TransactionBottomSheet,
  type TransactionBottomSheetHandle,
} from "@/components/TransactionBottomSheet";
import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { CurrentMonthSummary } from "@/components/home/CurrentMonthSummary";
import { RecentTransactions } from "@/components/home/RecentTransactions";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { FakerExpense } from "@/lib/util/faker";
import type { Expense } from "@/store/api/rtk/server/v1";
import { useCallback, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
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
      <ScrollView>
        <CurrentMonthSummary />
        <CategoryBreakdown />
        <RecentTransactions
          onPress={onPressTransaction}
          txs={txs}
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
