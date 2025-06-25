import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { db } from "../../db/drizzle";
import { type Expense, expense } from "../../db/schema";
import { getMonthRange } from "../../utils/datetime";
import { useRefreshKey } from "../contexts/RefreshKeyContext";
import { useUser } from "../contexts/UserContext";
import { ExpenseList } from "../ExpenseList";

interface Props {
	onPress: (expense: Expense) => void;
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
		const result = db
			.select()
			.from(expense)
			.where(
				and(
					eq(expense.userId, user.id),
					isNull(expense.deletedAt),
					gte(expense.incurredAt, from),
					lte(expense.incurredAt, to),
				),
			)
			.orderBy(desc(expense.incurredAt))
			.limit(10)
			.all();

		setExpenses(result);
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
