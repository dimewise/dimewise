import { Grid2 as Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Copyright } from "../components/Dashboard/Copyright";
import { CategoriesWidget } from "../components/Widgets/CategoriesWidget";
import { CurrentMonthWidget } from "../components/Widgets/CurrentMonthWidget";
import { MonthlyOverviewWidget } from "../components/Widgets/MonthlyOverviewWidget";
import { RecentTransactionsWidget } from "../components/Widgets/RecentTransactionsWidget";
import { PageNavbar } from "../components/layout/PrivateLayout/PageNavbar";

export const Overview = () => {
	const { t } = useTranslation();

	return (
		<>
			<PageNavbar title={t("nav.private.overview")} />
			<Grid
				container
				spacing={2}
				columns={12}
				sx={{ mb: (theme) => theme.spacing(2) }}
			>
				<CurrentMonthWidget />
			</Grid>
			<Copyright sx={{ my: 4 }} />
		</>
	);
};
