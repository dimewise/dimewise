import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export const EmptyHome = () => {
	const theme = useTheme();
	const { t } = useTranslation();

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
				{t("home.noBudgetCategories")}
			</Text>
			<Text
				variant="bodyMedium"
				style={{
					textAlign: "center",
					color: theme.colors.onSurfaceVariant,
					lineHeight: 24,
				}}
			>
				{t("home.setupCategories")}
			</Text>
		</View>
	);
};
