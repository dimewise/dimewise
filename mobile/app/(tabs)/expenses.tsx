import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { getCategoriesByUserId } from "../../db/repository/category";
import { getExpensesByUserId } from "../../db/repository/expense";
import { getPaymentMethodsByUserId } from "../../db/repository/paymentMethod";
import { formatAmount } from "../../db/utils";

export default function ExpensesScreen() {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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

	const loadData = async () => {
		if (!user?.id) return;

		try {
			setLoading(true);
			setError(null);

			// Load all data using repository functions
			const allExpenses = getExpensesByUserId(user.id, searchQuery, selectedCategory || undefined);
			const allCategories = getCategoriesByUserId(user.id);
			const allPaymentMethods = getPaymentMethodsByUserId(user.id);

			setExpenses(allExpenses);
			setCategories(allCategories);
			setPaymentMethods(allPaymentMethods);
		} catch (err) {
			console.error("Error loading expenses:", err);
			setError(err instanceof Error ? err.message : "Failed to load expenses");
		} finally {
			setLoading(false);
		}
	};

	// Load data when user changes or refresh keys change
	useEffect(() => {
		loadData();
	}, [user?.id, refreshKeys.expenses, refreshKeys.categories, refreshKeys.paymentMethods]);

	// Reload when search/filter changes
	useEffect(() => {
		if (user?.id) {
			loadData();
		}
	}, [searchQuery, selectedCategory]);

	const handleExpenseAdded = () => {
		triggerRefresh('expenses');
	};

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

	const handleExpenseVerificationUpdated = async () => {
		triggerRefresh('expenses');

		// Update the selectedExpense with fresh data
		if (selectedExpense && user?.id) {
			const updatedExpenses = getExpensesByUserId(user.id);
			const freshExpense = updatedExpenses.find(
				(e) => e.id === selectedExpense.id,
			);
			if (freshExpense) {
				setSelectedExpense(freshExpense);
			}
		}
	};

	const formatAmountLocal = (amount: number) => {
		return formatAmount(amount, userSetting?.currency || 'USD');
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	const getCategoryName = (categoryId: string) => {
		const category = categories.find((c) => c.id === categoryId);
		return category?.name || t("common.unknown");
	};

	// Error fallback with retry
	if (error) {
		return (
			<ExpensesErrorFallback
				onRetry={() => {
					setError(null);
					loadData();
				}}
			/>
		);
	}

	return (
		<ErrorBoundary
			fallback={<ExpensesErrorFallback onRetry={loadData} />}
			onError={(error, errorInfo) => {
				console.error('Expenses page error:', error, errorInfo);
			}}
		>
			<View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
				<SafeAreaView
					style={{ flex: 1, backgroundColor: theme.colors.background }}
					edges={["top"]}
				>
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

					<View
						style={{
							paddingHorizontal: 24,
							paddingBottom: 16,
							backgroundColor: theme.colors.background,
						}}
					>
						{categories.length > 0 && (
							<View style={{ gap: 8 }}>
								<Text
									variant="labelLarge"
									style={{ color: theme.colors.onBackground, fontWeight: "600" }}
								>
									{t("common.filter")}:
								</Text>
								<ScrollView horizontal showsHorizontalScrollIndicator={false}>
									<View
										style={{ flexDirection: "row", gap: 8, paddingRight: 16 }}
									>
										<Chip
											selected={selectedCategory === null}
											onPress={() => setSelectedCategory(null)}
										>
											{t("common.all")}
										</Chip>
										{categories.map((category) => (
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

					{loading ? (
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
							<Text>Loading expenses...</Text>
						</View>
					) : (
						<ScrollView
							style={{ flex: 1 }}
							contentContainerStyle={{ paddingBottom: 100 }}
						>
							{expenses.length === 0 ? (
								<View style={{ padding: 24, alignItems: 'center' }}>
									<Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
										{searchQuery || selectedCategory
											? "No matching expenses found"
											: "No expenses yet"
										}
									</Text>
								</View>
							) : (
								expenses.map((expense) => (
									<ExpenseListItem
										key={expense.id}
										expense={expense}
										onPress={() => handleExpensePress(expense)}
									/>
								))
							)}
						</ScrollView>
					)}

					{/* PERIPHERALS */}
					<FAB
						icon="plus"
						label={t("expenses.newExpense")}
						onPress={() => setShowExpenseSheet(true)}
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
							handleExpenseAdded(); // Trigger refresh when bottom sheet closes
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
