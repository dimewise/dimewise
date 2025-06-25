import { and, eq, isNull } from "drizzle-orm";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Text, useTheme } from "react-native-paper";
import { db } from "../db/drizzle";
import {
	type Category,
	category,
	type Expense,
	type PaymentMethod,
	paymentMethod,
} from "../db/schema";
import { useUser } from "./contexts/UserContext";
import ExpenseListItem from "./ExpenseListItem";

interface Props {
	expenses: Expense[];
	hideDescription?: boolean;
	onPress: (expense: Expense) => void;
}

export const ExpenseList = ({
	expenses,
	hideDescription = false,
	onPress,
}: Props) => {
	const theme = useTheme();
	const { t } = useTranslation();
	const { user } = useUser();

	const [categories, setCategories] = useState<Category[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

	useEffect(() => {
		if (!user) return;
		// Fetch categories and payment methods for the user
		const cats = db
			.select()
			.from(category)
			.where(and(eq(category.userId, user.id), isNull(category.deletedAt)))
			.all();

		const pms = db
			.select()
			.from(paymentMethod)
			.where(
				and(eq(paymentMethod.userId, user.id), isNull(paymentMethod.deletedAt)),
			)
			.all();

		setCategories(cats);
		setPaymentMethods(pms);
	}, [user]);

	if (expenses.length === 0) {
		return (
			<View
				style={{
					padding: 48,
					alignItems: "center",
					backgroundColor: theme.colors.surface,
					borderRadius: 8,
					borderWidth: 1,
					borderColor: theme.colors.outline,
				}}
			>
				<Text
					variant="titleLarge"
					style={{
						textAlign: "center",
						marginBottom: 16,
						fontWeight: "600",
						color: theme.colors.onSurface,
					}}
				>
					{t("expenses.noExpenses")}
				</Text>
				<Text
					variant="bodyMedium"
					style={{
						textAlign: "center",
						color: theme.colors.onSurfaceVariant,
						lineHeight: 24,
					}}
				>
					{t("expenses.addExpensePrompt")}
				</Text>
			</View>
		);
	}

	return (
		<FlatList
			data={expenses}
			keyExtractor={(item) => item.id}
			renderItem={({ item: expense }) => {
				const categoryObj = categories.find((c) => c.id === expense.categoryId);
				const paymentMethodObj = paymentMethods.find(
					(p) => p.id === expense.paymentMethodId,
				);
				return (
					<ExpenseListItem
						expense={expense}
						category={categoryObj}
						paymentMethod={paymentMethodObj}
						hideDescription={hideDescription}
						onPress={onPress}
					/>
				);
			}}
			contentContainerStyle={{ paddingBottom: 16 }}
		/>
	);
};
