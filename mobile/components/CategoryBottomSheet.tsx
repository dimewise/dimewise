import { useAppTheme } from "@/hooks/useAppTheme";
import { FakerExpense } from "@/lib/util/faker";
import type { CategoryFull, Expense } from "@/store/api/rtk/server/v1";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Dimensions, View } from "react-native";
import { Button, ProgressBar, Text } from "react-native-paper";
import { RecentTransactions } from "./home/RecentTransactions";

const screenHeight = Dimensions.get("window").height;
const maxContentSize = screenHeight * 0.75;

export type CategoryBottomSheetHandle = {
  open: () => void;
  close: () => void;
};

type CategoryBottomSheetProps = {
  category: CategoryFull | null;
  setCategory: (category: CategoryFull | null) => void;
};

export const CategoryBottomSheet = forwardRef<
  CategoryBottomSheetHandle,
  CategoryBottomSheetProps
>(({ category, setCategory }, ref) => {
  const theme = useAppTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const progressValue = (category?.spent ?? 0) / (category?.budget ?? 1);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    open: () => {
      bottomSheetModalRef.current?.present();
    },
    close: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  const handleClose = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setCategory(null);
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

  // TODO: Switch use API call
  const txs: Expense[] = [
    FakerExpense,
    FakerExpense,
    FakerExpense,
    FakerExpense,
    FakerExpense,
    FakerExpense,
    FakerExpense,
    FakerExpense,
    FakerExpense,
  ];

  if (!category) {
    return;
  }

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.outline }}
        enableDynamicSizing
        maxDynamicContentSize={maxContentSize}
        onDismiss={() => setCategory(null)}
      >
        <BottomSheetView
          style={{
            flex: 1,
            paddingVertical: 24,
          }}
        >
          <Text
            variant="titleMedium"
            style={{ fontWeight: "semibold", textAlign: "center" }}
          >
            {category.name}
          </Text>
          <View
            style={{
              paddingVertical: 16,
              paddingHorizontal: 24,
              gap: 16,
            }}
          >
            <Text
              variant="headlineLarge"
              style={{
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {`JPY ${category.spent}/ JPY ${category.budget}`}
            </Text>
            <ProgressBar
              animatedValue={progressValue}
              style={{ borderRadius: 20, height: 8 }}
              color={theme.colors.primary}
            />
          </View>
          <RecentTransactions
            onPress={() => {}}
            txs={txs}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              paddingHorizontal: 24,
              gap: 16,
            }}
          >
            <Button
              mode="outlined"
              style={{ flex: 1 }}
              onPress={handleClose}
              textColor={theme.colors.primary}
            >
              Close
            </Button>
            <Button
              mode="contained"
              style={{ flex: 1 }}
              buttonColor={theme.colors.primary}
            >
              Edit
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
});
