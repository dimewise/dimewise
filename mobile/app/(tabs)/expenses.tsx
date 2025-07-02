import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
	Button,
	Card,
	Chip,
	FAB,
	Searchbar,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import EditExpenseBottomSheet from "../../components/EditExpenseBottomSheet";
import ExpenseBottomSheet from "../../components/ExpenseBottomSheet";
import ExpenseDetailBottomSheet from "../../components/ExpenseDetailBottomSheet";
import ExpenseListItem from "../../components/ExpenseListItem";
import ErrorBoundary, { ExpensesErrorFallback } from "../../components/ErrorBoundary";
import { useRefreshKey } from "../../components/contexts/RefreshKeyContext";
import { useUser } from "../../components/contexts/UserContext";
import type { Category, Expense, PaymentMethod } from "../../db/schema";
import type { ExpenseWithDetails } from "../../db/repository/types";
import { getCategoriesByUserId } from "../../db/repository/category";
import { getExpensesWithDetailsByUserId } from "../../db/repository/expense";
import { getPaymentMethodsByUserId } from "../../db/repository/paymentMethod";
import { formatAmount } from "../../db/utils";
import { useMultipleAsyncData } from "../../hooks/useAsyncData";

export default function ExpensesScreen() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [showExpenseSheet, setShowExpenseSheet] = useState(false);
	const [showDetailSheet, setShowDetailSheet] = useState(false);
	const [showEditSheet, setShowEditSheet] = useState(false);
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [isTransitioningToEdit, setIsTransitioningToEdit] = useState(false);

	const theme = useTheme();
	const { t } = useTranslation();
	const { user, userSetting } = useUser();
	const { refreshKeys, triggerRefresh } = useRefreshKey();
	const timeoutRef = useRef<number | null>(null);

	// Load all data using our optimized hook - expenses now include category/payment method data
	const { data, loading, error, refetch } = useMultipleAsyncData(
		{
			expenses: () => getExpensesWithDetailsByUserId(user!.id),
			categories: () => getCategoriesByUserId(user!.id),
			paymentMethods: () => getPaymentMethodsByUserId(user!.id),
		},
		{
			immediate: !!user?.id,
			deps: [user?.id, refreshKeys.expenses, refreshKeys.categories, refreshKeys.paymentMethods]
		}
	);

	// Filter expenses based on search and category selection
	const filteredExpenses = useMemo(() => {
		if (!data?.expenses) return [];

		return (data.expenses as ExpenseWithDetails[]).filter((expense: ExpenseWithDetails) => {
			const matchesSearch = !searchQuery ||
				expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(expense.description && expense.description.toLowerCase().includes(searchQuery.toLowerCase()));

			const matchesCategory = !selectedCategory || expense.categoryId === selectedCategory;

			return matchesSearch && matchesCategory;
		});
	}, [data?.expenses, searchQuery, selectedCategory]);

	useFocusEffect(
		useCallback(() => {
			// Close bottom sheets when navigating to this tab
			setShowExpenseSheet(false);
			setShowDetailSheet(false);
			setShowEditSheet(false);
			setSelectedExpense(null);
			setIsTransitioningToEdit(false);

			// Cleanup timeout on unmount
			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}, []),
	);

	const handleExpenseAdded = () => {
		triggerRefresh('expenses');
	};

	const handleExpensePress = useCallback((expense: Expense) => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// If detail sheet is already supposed to be open but user clicked again, 
		// it means there's a display issue - force reset and reopen
		if (showDetailSheet) {
			setShowDetailSheet(false);
			setSelectedExpense(null);
			timeoutRef.current = setTimeout(() => {
				setSelectedExpense(expense);
				setShowDetailSheet(true);
			}, 100);
			return;
		}

		// If any other bottom sheet is currently open, add a small delay to avoid animation conflicts
		if (showExpenseSheet || showEditSheet) {
			timeoutRef.current = setTimeout(() => {
				setSelectedExpense(expense);
				setShowDetailSheet(true);
			}, 300);
		} else {
			setSelectedExpense(expense);
			setShowDetailSheet(true);
		}
	}, [showDetailSheet, showExpenseSheet, showEditSheet]);

	const handleEditExpense = (expense: Expense) => {
		setIsTransitioningToEdit(true);
		setShowDetailSheet(false);
		setShowEditSheet(true);
	};

	const handleExpenseUpdated = () => {
		triggerRefresh('expenses');
		setShowEditSheet(false);
		setSelectedExpense(null);
		setIsTransitioningToEdit(false);
	};

	const handleExpenseDeleted = () => {
		triggerRefresh('expenses');
		setShowDetailSheet(false);
		setSelectedExpense(null);
	};

	const handleExpenseVerificationUpdated = () => {
		triggerRefresh('expenses');
		// Refetch will automatically update selectedExpense through the data flow
	};

	const formatAmountLocal = (amount: number) => {
		return formatAmount(amount, userSetting?.currency || 'USD');
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	const getCategoryName = (categoryId: string) => {
		const category = data?.categories.find((c) => c.id === categoryId);
		return category?.name || t("common.unknown");
	};

	// Error fallback with retry
	if (error) {
		return (
			<ExpensesErrorFallback
				onRetry={() => {
					refetch();
				}}
			/>
		);
	}

	return (
		<ErrorBoundary
			fallback={<ExpensesErrorFallback onRetry={refetch} />}
			onError={(error, errorInfo) => {
				console.error('Expenses page error:', error, errorInfo);
			}}
		>
			<View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
				<SafeAreaView
					style={{ flex: 1, backgroundColor: theme.colors.background }}
					edges={["top"]}
				>
					{/* SEARCH HEADER */}
					<View
						style={{
							paddingTop: 16,
							paddingHorizontal: 24,
							paddingBottom: 16,
							backgroundColor: theme.colors.background,
						}}
					>
						<Text
							variant="headlineMedium"
							style={{
								fontWeight: "700",
								marginBottom: 16,
								color: theme.colors.onBackground,
							}}
						>
							{t("expenses.title")}
						</Text>
						<Searchbar
							placeholder={t("common.search")}
							onChangeText={setSearchQuery}
							value={searchQuery}
							style={{
								backgroundColor: theme.colors.surface,
								borderWidth: 1,
								borderColor: theme.colors.outline,
							}}
						/>
					</View>

					{/* CATEGORY FILTERS */}
					<View
						style={{
							paddingHorizontal: 24,
							paddingBottom: 16,
							backgroundColor: theme.colors.background,
						}}
					>
						{data?.categories && data.categories.length > 0 && (
							<View style={{ gap: 8 }}>
								<Text
									variant="labelLarge"
									style={{ color: theme.colors.onBackground, fontWeight: "600" }}
								>
									{t("common.filter")}:
								</Text>
								<ScrollView horizontal showsHorizontalScrollIndicator={false}>
									<View style={{ flexDirection: "row", gap: 8, paddingRight: 16 }}>
										<Chip
											selected={selectedCategory === null}
											onPress={() => setSelectedCategory(null)}
										>
											{t("common.all")}
										</Chip>
										{data.categories.map((category) => (
											<Chip
												key={category.id}
												selected={selectedCategory === category.id}
												onPress={() =>
													setSelectedCategory(
														selectedCategory === category.id ? null : category.id,
													)
												}
											>
												{category.name}
											</Chip>
										))}
									</View>
								</ScrollView>
							</View>
						)}
					</View>

					{/* EXPENSE LIST */}
					{loading ? (
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
							<Text>Loading expenses...</Text>
						</View>
					) : (
						<ScrollView
							style={{ flex: 1 }}
							contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 24 }}
						>
							{filteredExpenses.length === 0 ? (
								<View style={{ padding: 24, alignItems: 'center' }}>
									<Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
										{searchQuery || selectedCategory
											? "No matching expenses found"
											: "No expenses yet"
										}
									</Text>
								</View>
							) : (
								filteredExpenses.map((expense: ExpenseWithDetails) => (
									<ExpenseListItem
										key={expense.id}
										expense={expense}
										category={expense.category}
										paymentMethod={expense.paymentMethod}
										onPress={() => handleExpensePress(expense)}
									/>
								))
							)}
						</ScrollView>
					)}

					{/* FLOATING ACTION BUTTON */}
					<FAB
						icon="plus"
						label={t("expenses.newExpense")}
						onPress={() => {
							setShowExpenseSheet(true);
						}}
						style={{
							position: "absolute",
							bottom: 16,
							right: 16,
						}}
					/>

					{/* BOTTOM SHEETS */}
					<ExpenseBottomSheet
						visible={showExpenseSheet}
						onDismiss={() => {
							setShowExpenseSheet(false);
							handleExpenseAdded();
						}}
					/>
					<ExpenseDetailBottomSheet
						visible={showDetailSheet}
						expenseId={selectedExpense?.id || null}
						onDismiss={() => {
							setShowDetailSheet(false);
							if (!isTransitioningToEdit) {
								setSelectedExpense(null);
							}
						}}
						onEdit={handleEditExpense}
						onDeleted={handleExpenseDeleted}
					/>
					<EditExpenseBottomSheet
						visible={showEditSheet}
						expenseId={selectedExpense?.id || null}
						onDismiss={() => {
							setShowEditSheet(false);
							setSelectedExpense(null);
							setIsTransitioningToEdit(false);
						}}
						onExpenseUpdated={handleExpenseUpdated}
					/>
				</SafeAreaView>
			</View>
		</ErrorBoundary>
	);
}
