import {
  TransactionBottomSheet,
  type TransactionBottomSheetHandle,
} from "@/components/TransactionBottomSheet";
import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { CurrentMonthSummary } from "@/components/home/CurrentMonthSummary";
import { RecentTransactions } from "@/components/home/RecentTransactions";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
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

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ScrollView>
        <CurrentMonthSummary />
        <CategoryBreakdown />
        <RecentTransactions onPress={onPressTransaction} />
      </ScrollView>
      <TransactionBottomSheet
        ref={txModalRef}
        tx={selectedTx}
      />
    </SafeAreaView>
  );
}
