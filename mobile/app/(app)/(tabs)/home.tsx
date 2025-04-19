import {
  TransactionBottomSheet,
  type TransactionBottomSheetHandle,
} from "@/components/TransactionBottomSheet";
import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { CurrentMonthSummary } from "@/components/home/CurrentMonthSummary";
import { RecentTransactions } from "@/components/home/RecentTransactions";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { useCallback, useRef } from "react";
import { ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);

  /* modal - bottom sheet */
  const txModalRef = useRef<TransactionBottomSheetHandle>(null);
  const handlePresentModalPress = useCallback(() => {
    txModalRef.current?.open();
  }, []);
  const handleSaveTransaction = (data: {}) => {
    console.log("Transaction data:", data);
    // Process the transaction data here
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ScrollView>
        <Button onPress={handlePresentModalPress}>Press Me</Button>
        <CurrentMonthSummary />
        <CategoryBreakdown />
        <RecentTransactions />
      </ScrollView>
      <TransactionBottomSheet
        ref={txModalRef}
        onSave={handleSaveTransaction}
      />
    </SafeAreaView>
  );
}
