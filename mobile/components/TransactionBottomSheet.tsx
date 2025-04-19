import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

// Define the handle methods that will be exposed
export type TransactionBottomSheetHandle = {
  open: () => void;
  close: () => void;
};

// Define props if needed
type TransactionBottomSheetProps = {
  onSave?: (data: TransactionData) => void;
  onCancel?: () => void;
};

// Define the transaction data structure
type TransactionData = {
  amount: string;
  category: string;
  description: string;
  date: Date;
};

export const TransactionBottomSheet = forwardRef<
  TransactionBottomSheetHandle,
  TransactionBottomSheetProps
>(({ onSave, onCancel }, ref) => {
  // Create a ref for the bottom sheet
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Define snap points (where the sheet can rest)
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  // Form state
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(new Date());

  const theme = useTheme();

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

  // Handle saving the transaction
  const handleSave = useCallback(() => {
    const transactionData: TransactionData = {
      amount,
      category,
      description,
      date,
    };

    onSave?.(transactionData);
    bottomSheetModalRef.current?.dismiss();

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date());
  }, [amount, category, description, date, onSave]);

  // Handle canceling
  const handleCancel = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    onCancel?.();

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date());
  }, [onCancel]);

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

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.outline }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Add Transaction</Text>

        <View style={styles.inputGroup}>
          <MaterialCommunityIcons
            name="currency-usd"
            size={24}
            color={theme.colors.primary}
          />
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            mode="outlined"
          />
        </View>

        <View style={styles.inputGroup}>
          <MaterialCommunityIcons
            name="tag-multiple"
            size={24}
            color={theme.colors.primary}
          />
          <TextInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
            mode="outlined"
          />
        </View>

        <View style={styles.inputGroup}>
          <MaterialCommunityIcons
            name="text"
            size={24}
            color={theme.colors.primary}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
          />
        </View>

        {/* Date would ideally use a DatePicker component */}
        <Text style={styles.dateText}>Date: {date.toLocaleDateString()}</Text>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            disabled={!amount.trim()}
          >
            Save
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
  dateText: {
    marginVertical: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    width: width / 2 - 24,
  },
});
