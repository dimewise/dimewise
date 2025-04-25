import { useAppTheme } from "@/hooks/useAppTheme";
import type { Expense } from "@/store/api/rtk/server/v1";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useLocales } from "expo-localization";
import { DateTime } from "luxon";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { View } from "react-native";
import { Button, Chip, Text } from "react-native-paper";

// Define the handle methods that will be exposed
export type TransactionBottomSheetHandle = {
  open: () => void;
  close: () => void;
};

// Define props if needed
type TransactionBottomSheetProps = {
  tx: Expense | null;
};

export const TransactionBottomSheet = forwardRef<
  TransactionBottomSheetHandle,
  TransactionBottomSheetProps
>(({ tx }, ref) => {
  const theme = useAppTheme();
  const locale = useLocales();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // datetime
  const userLocale = locale[0].languageTag;
  const displayDate = tx
    ? DateTime.fromISO(tx.date)
        .setLocale(userLocale)
        .toLocaleString(DateTime.DATE_MED)
    : "";

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    open: () => {
      bottomSheetModalRef.current?.present();
    },
    close: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // Customize backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  if (!tx) {
    return;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.outline }}
      enableDynamicSizing
    >
      <BottomSheetView
        style={{
          flex: 1,
          padding: 24,
        }}
      >
        <Text
          variant="titleMedium"
          style={{ fontWeight: "semibold", textAlign: "center" }}
        >
          {tx.title}
        </Text>
        <Text
          variant="titleSmall"
          style={{ textAlign: "center" }}
        >
          {displayDate}
        </Text>
        <View
          style={{
            paddingVertical: 72,
            gap: 16,
          }}
        >
          <Text
            variant="headlineLarge"
            style={{
              fontWeight: "bold",
              textAlign: "center",
              color: theme.colors.error,
            }}
          >
            {"- JPY " + tx.amount}
          </Text>
          <Chip
            icon="tag"
            style={{ marginHorizontal: "auto" }}
          >
            {tx.category.name}
          </Chip>
        </View>
        <Text
          variant="bodyMedium"
          style={{ fontWeight: "semibold", textAlign: "center" }}
        >
          {tx.description}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 24,
            gap: 16,
          }}
        >
          <Button
            mode="outlined"
            style={{ flex: 1 }}
          >
            Close
          </Button>
          <Button
            mode="contained"
            style={{ flex: 1 }}
          >
            Edit
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
