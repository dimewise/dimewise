import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { CategoryWithSpending } from "../db/repository/types";
import type { Category } from "../db/schema";
import { formatAmount } from "../db/utils";
import { useUser } from "./contexts/UserContext";

interface Props {
	category: CategoryWithSpending | Category;
}

function isCategoryWithSpending(
	cat: CategoryWithSpending | Category,
): cat is CategoryWithSpending {
	return typeof (cat as CategoryWithSpending).spent === "number";
}

export const CategoryListItem = ({ category }: Props) => {
	const theme = useTheme();
	const { t } = useTranslation();
	const { userSetting } = useUser();
	const currency = userSetting?.currency ?? "USD";

	// Type guard for CategoryWithSpending
	const spent = isCategoryWithSpending(category) ? category.spent : undefined;
	const budget = category.budget ?? 0;
	const percentage = isCategoryWithSpending(category)
		? category.percentage
		: undefined;

	// Derived values
	const spentFormatted =
		spent !== undefined ? formatAmount(spent, currency) : null;
	const budgetFormatted = formatAmount(budget, currency);

	const remaining = spent !== undefined ? budget - spent : undefined;
	const overBudget = spent !== undefined ? spent - budget : undefined;
	const remainingFormatted =
		remaining !== undefined && remaining >= 0
			? formatAmount(remaining, currency)
			: null;
	const overBudgetFormatted =
		remaining !== undefined && remaining < 0
			? formatAmount(overBudget!, currency)
			: null;

	return (
		<View
			style={{
				marginVertical: 4,
				padding: 24,
				backgroundColor: theme.colors.surface,
				borderRadius: 8,
				borderWidth: 1,
				borderColor: theme.colors.outline,
				shadowColor: "#000000",
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.05,
				shadowRadius: 2,
				elevation: 1,
			}}
		>
			<View style={{ gap: 20 }}>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Text
						variant="titleMedium"
						style={{ fontWeight: "600", color: theme.colors.onSurface }}
					>
						{category.name}
					</Text>
					<Text
						variant="bodyMedium"
						style={{
							fontWeight: "600",
							color:
								percentage !== undefined && percentage >= 90
									? theme.colors.error
									: percentage !== undefined && percentage >= 75
										? theme.colors.onSurfaceVariant
										: theme.colors.onSurface,
						}}
					>
						{spentFormatted
							? `${spentFormatted} / ${budgetFormatted}`
							: budgetFormatted}
					</Text>
				</View>

				{spent !== undefined && percentage !== undefined && (
					<View style={{ gap: 16 }}>
						<View
							style={{
								height: 6,
								backgroundColor: theme.colors.surfaceVariant,
								borderRadius: 3,
								overflow: "hidden",
							}}
						>
							<View
								style={{
									height: "100%",
									width: `${Math.min(percentage, 100)}%`,
									backgroundColor:
										percentage >= 90
											? theme.colors.error
											: percentage >= 75
												? theme.colors.onSurfaceVariant
												: theme.colors.primary,
									borderRadius: 3,
								}}
							/>
						</View>

						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Text
								variant="bodySmall"
								style={{
									color: theme.colors.onSurfaceVariant,
									fontWeight: "500",
								}}
							>
								{percentage.toFixed(1)}% {t("status.used")}
							</Text>
							<Text
								variant="bodySmall"
								style={{
									fontWeight: "600",
									color:
										remaining !== undefined && remaining >= 0
											? theme.colors.onSurfaceVariant
											: theme.colors.error,
								}}
							>
								{remaining !== undefined && remaining >= 0
									? `${remainingFormatted} ${t("home.remaining")}`
									: overBudgetFormatted
										? `${overBudgetFormatted} ${t("expenses.overBudget")}`
										: null}
							</Text>
						</View>
					</View>
				)}
			</View>
		</View>
	);
};
