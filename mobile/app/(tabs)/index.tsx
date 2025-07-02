import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { Divider, FAB, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import EditExpenseBottomSheet from "../../components/EditExpenseBottomSheet";
import ExpenseBottomSheet from "../../components/ExpenseBottomSheet";
import ExpenseDetailBottomSheet from "../../components/ExpenseDetailBottomSheet";
import ErrorBoundary from "../../components/ErrorBoundary";
import { BudgetOverview } from "../../components/Home/BudgetOverview";
import { CategoriesBreakdown } from "../../components/Home/CategoriesBreakdown";
import { RecentTransactions } from "../../components/Home/RecentTransactions";
import type { Expense } from "../../db/schema";

export default function HomePage() {
	const [showExpenseSheet, setShowExpenseSheet] = useState(false);
	const [showDetailSheet, setShowDetailSheet] = useState(false);
	const [showEditSheet, setShowEditSheet] = useState(false);
	const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
		null,
	);
	const [isTransitioningToEdit, setIsTransitioningToEdit] = useState(false);
	const theme = useTheme();
	const { t } = useTranslation();
	const timeoutRef = useRef<number | null>(null);

	useFocusEffect(
		useCallback(() => {
			// Close bottom sheets when navigating to this tab
			setShowExpenseSheet(false);
			setShowDetailSheet(false);
			setShowEditSheet(false);
			setSelectedExpenseId(null);
			setIsTransitioningToEdit(false);

			// Cleanup timeout on unmount
			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}, []),
	);

	const handleExpensePress = useCallback((expense: Expense) => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// If detail sheet is already supposed to be open but user clicked again, 
		// it means there's a display issue - force reset and reopen
		if (showDetailSheet) {
			setShowDetailSheet(false);
			setSelectedExpenseId(null);
			timeoutRef.current = setTimeout(() => {
				setSelectedExpenseId(expense.id);
				setShowDetailSheet(true);
			}, 100);
			return;
		}

		// If any other bottom sheet is currently open, add a small delay to avoid animation conflicts
		if (showExpenseSheet || showEditSheet) {
			timeoutRef.current = setTimeout(() => {
				setSelectedExpenseId(expense.id);
				setShowDetailSheet(true);
			}, 300);
		} else {
			setSelectedExpenseId(expense.id);
			setShowDetailSheet(true);
		}
	}, [showDetailSheet, showExpenseSheet, showEditSheet]);

	const handleEditExpense = (expense: Expense) => {
		setIsTransitioningToEdit(true);
		setShowDetailSheet(false);
		setShowEditSheet(true);
	};

	const handleExpenseUpdated = () => {
		setShowEditSheet(false);
		setSelectedExpenseId(null);
		setIsTransitioningToEdit(false);
	};

	const handleExpenseDeleted = () => {
		setShowDetailSheet(false);
		setSelectedExpenseId(null);
	};

	return (
		<ErrorBoundary
			onError={(error, errorInfo) => {
				console.error('Dashboard error:', error, errorInfo);
			}}
		>
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
					onPress={() => {
						setShowExpenseSheet(true);
					}}
					style={{
						position: "absolute",
						bottom: 16,
						right: 16,
					}}
				/>
				<ExpenseBottomSheet
					visible={showExpenseSheet}
					onDismiss={() => {
						setShowExpenseSheet(false);
					}}
				/>
				<ExpenseDetailBottomSheet
					visible={showDetailSheet}
					expenseId={selectedExpenseId}
					onDismiss={() => {
						setShowDetailSheet(false);
						if (!isTransitioningToEdit) {
							setSelectedExpenseId(null);
						}
					}}
					onEdit={handleEditExpense}
					onDeleted={handleExpenseDeleted}
				/>
				<EditExpenseBottomSheet
					visible={showEditSheet}
					expenseId={selectedExpenseId}
					onDismiss={() => {
						setShowEditSheet(false);
						setSelectedExpenseId(null);
						setIsTransitioningToEdit(false);
					}}
					onExpenseUpdated={handleExpenseUpdated}
				/>
			</SafeAreaView>
		</ErrorBoundary>
	);
}
