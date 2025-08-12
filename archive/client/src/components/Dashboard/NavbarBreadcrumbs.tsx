import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Routes } from "../../Routes";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
	margin: theme.spacing(1, 0),
	[`& .${breadcrumbsClasses.separator}`]: {
		color: theme.palette.action.disabled,
		margin: 1,
	},
	[`& .${breadcrumbsClasses.ol}`]: {
		alignItems: "center",
	},
}));

const getBreadcrumbName = (path: string) => {
	switch (path) {
		case Routes.Overview:
			return "nav.private.home";
		case Routes.Transactions:
			return "nav.private.transactions";
		case Routes.Categories:
			return "nav.private.categories";
		case Routes.Settings:
			return "nav.private.settings";
		case Routes.About:
			return "nav.private.about";
		case Routes.Feedback:
			return "nav.private.feedback";
		default:
			return "nav.private.home";
	}
};

export const NavbarBreadcrumbs = () => {
	const { t } = useTranslation();
	const location = useLocation();

	return (
		<StyledBreadcrumbs
			aria-label="breadcrumb"
			separator={<NavigateNextRoundedIcon fontSize="small" />}
		>
			<Typography variant="body1">{t("nav.private.dashboard")}</Typography>
			<Typography
				variant="body1"
				sx={{ color: "text.primary", fontWeight: 600 }}
			>
				{t(`${getBreadcrumbName(location.pathname)}`)}
			</Typography>
		</StyledBreadcrumbs>
	);
};
