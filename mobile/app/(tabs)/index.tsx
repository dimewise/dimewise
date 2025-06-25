import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { Divider, FAB, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import EditExpenseBottomSheet from "../../components/EditExpenseBottomSheet";
import ExpenseBottomSheet from "../../components/ExpenseBottomSheet";
import ExpenseDetailBottomSheet from "../../components/ExpenseDetailBottomSheet";
import { BudgetOverview } from "../../components/Home/BudgetOverview";
import { CategoriesBreakdown } from "../../components/Home/CategoriesBreakdown";
import { RecentTransactions } from "../../components/Home/RecentTransactions";
import type { Category, Expense, PaymentMethod } from "../../db/schema";
import { formatAmount } from "../../db/utils";

interface CategoryWithSpending extends Category {
	spent: number;
	percentage: number;
}

export default function HomePage() {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [categories, setCategories] = useState<CategoryWithSpending[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [showExpenseSheet, setShowExpenseSheet] = useState(false);
	const [showDetailSheet, setShowDetailSheet] = useState(false);
	const [showEditSheet, setShowEditSheet] = useState(false);
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [isTransitioningToEdit, setIsTransitioningToEdit] = useState(false);
	const theme = useTheme();
	const { t } = useTranslation();

	useFocusEffect(
		useCallback(() => {
			// Close bottom sheets when navigating to this tab
			setShowExpenseSheet(false);
			setShowDetailSheet(false);
			setShowEditSheet(false);
			setSelectedExpense(null);
			setIsTransitioningToEdit(false);
		}, []),
	);

	const handleExpensePress = (expense: Expense) => {
		setSelectedExpense(expense);
		setShowDetailSheet(true);
	};

	const handleEditExpense = (expense: Expense) => {
		setIsTransitioningToEdit(true);
		setShowDetailSheet(false);
		setShowEditSheet(true);
	};

	const handleExpenseUpdated = () => {
		setShowEditSheet(false);
		setSelectedExpense(null);
		setIsTransitioningToEdit(false);
	};

	const handleExpenseDeleted = () => {
		setShowDetailSheet(false);
		setSelectedExpense(null);
	};

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
			edges={["top", "left", "right"]}
		>
			<ScrollView
				style={{ flex: 1, backgroundColor: theme.colors.background }}
				contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
			>
				<BudgetOverview />
				<CategoriesBreakdown />
				<Divider />
				<RecentTransactions onPress={handleExpensePress} />
			</ScrollView>

			{/* PERIPHERALS */}
			<FAB
				icon="plus"
				label={t("home.newExpense")}
				onPress={() => setShowExpenseSheet(true)}
				style={{
					position: "absolute",
					bottom: 16,
					right: 16,
				}}
			/>
			<ExpenseBottomSheet
				visible={showExpenseSheet}
				onDismiss={() => setShowExpenseSheet(false)}
			/>
			<ExpenseDetailBottomSheet
				visible={showDetailSheet}
				expense={selectedExpense}
				category={
					selectedExpense
						? categories.find((c) => c.id === selectedExpense.categoryId)
						: undefined
				}
				paymentMethod={
					selectedExpense
						? paymentMethods.find(
								(p) => p.id === selectedExpense.paymentMethodId,
							)
						: undefined
				}
				onDismiss={() => {
					setShowDetailSheet(false);
					if (!isTransitioningToEdit) {
						setSelectedExpense(null);
					}
				}}
				onEdit={handleEditExpense}
				onDeleted={handleExpenseDeleted}
				onExpenseUpdated={handleExpenseVerificationUpdated}
			/>
			<EditExpenseBottomSheet
				visible={showEditSheet}
				expense={selectedExpense}
				onDismiss={() => {
					setShowEditSheet(false);
					setSelectedExpense(null);
					setIsTransitioningToEdit(false);
				}}
				onExpenseUpdated={handleExpenseUpdated}
			/>
		</SafeAreaView>
	);
}
