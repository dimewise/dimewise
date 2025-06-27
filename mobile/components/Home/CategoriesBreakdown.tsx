import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { getCategoriesByUserId } from "../../db/repository/category";
import { getExpensesInRangeByUserId } from "../../db/repository/expense";
import type { CategoryWithSpending } from "../../db/repository/types";
import { getMonthRange } from "../../utils/datetime";
import { CategoryList } from "../CategoryList";
import { useRefreshKey } from "../contexts/RefreshKeyContext";
import { useUser } from "../contexts/UserContext";

export const CategoriesBreakdown = () => {
	const theme = useTheme();
	const { t } = useTranslation();
	const { user } = useUser();
	const { refreshKeys } = useRefreshKey();
	const [categories, setCategories] = useState<CategoryWithSpending[]>([]);

	useEffect(() => {
		if (!user) return;

		// Fetch categories (excluding deleted)
		const categories = getCategoriesByUserId(user.id);

		// Fetch this month's expenses (excluding deleted)
		const { from, to } = getMonthRange(new Date());
		const expenses = getExpensesInRangeByUserId(user.id, from, to);

		// Group expenses by categoryId
		const categoryTotals: Record<string, number> = {};
		let uncategorizedTotal = 0;

		expenses.forEach((exp) => {
			if (exp.categoryId) {
				categoryTotals[exp.categoryId] =
					(categoryTotals[exp.categoryId] || 0) + exp.amount;
			} else {
				uncategorizedTotal += exp.amount;
			}
		});

		// Shape the data
		const result: CategoryWithSpending[] = categories.map((cat) => {
			const spent = categoryTotals[cat.id] || 0;
			const percentage = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
			return {
				id: cat.id,
				name: cat.name,
				budget: cat.budget,
				spent,
				percentage,
			} as CategoryWithSpending;
		});

		// Add "Uncategorized" if needed
		if (uncategorizedTotal > 0) {
			result.push({
				id: "uncategorized",
				name: "Uncategorized",
				budget: 0,
				spent: uncategorizedTotal,
				percentage: 0,
			} as CategoryWithSpending);
		}

		setCategories(result);
	}, [user, refreshKeys]);

	return (
		<View>
			<Text
				variant="headlineMedium"
				style={{
					marginBottom: 24,
					fontWeight: "700",
					color: theme.colors.onBackground,
				}}
			>
				{t("categories.title")}
			</Text>
			<CategoryList categories={categories} />
		</View>
	);
};
