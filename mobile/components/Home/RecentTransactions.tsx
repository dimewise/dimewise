import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { getExpensesInRangeByUserId } from "../../db/repository/expense";
import type { Expense } from "../../db/schema";
import { getMonthRange } from "../../utils/datetime";
import { useRefreshKey } from "../contexts/RefreshKeyContext";
import { useUser } from "../contexts/UserContext";
import { ExpenseList } from "../ExpenseList";

interface Props {
	onPress: (expenseId: string) => void;
}

export const RecentTransactions = ({ onPress }: Props) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const { user } = useUser();
	const { refreshKeys } = useRefreshKey();

	const [expenses, setExpenses] = useState<Expense[]>([]);

	useEffect(() => {
		if (!user) return;

		const { from, to } = getMonthRange(new Date());
		const recentExpenses = getExpensesInRangeByUserId(user.id, from, to, 10);
		setExpenses(recentExpenses);
	}, [user, refreshKeys.expenses]);

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
			<ExpenseList expenses={expenses} hideDescription onPress={onPress} />
		</View>
	);
};
