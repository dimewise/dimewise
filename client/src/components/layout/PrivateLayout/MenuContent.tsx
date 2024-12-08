import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Divider } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import { useTranslation } from "react-i18next";
import { Link, useMatch } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import { Routes } from "../../../Routes";

interface MenuListItemType {
	id: string;
	text: string;
	icon: JSX.Element;
	route: Routes;
}

export const MenuContent = () => {
	const { t } = useTranslation();

	const mainListItems: MenuListItemType[] = [
		{ id: "nav-home", text: t("nav.private.home"), icon: <HomeRoundedIcon />, route: Routes.Overview },
		{
			id: "nav-transactions",
			text: t("nav.private.transactions"),
			icon: <AnalyticsRoundedIcon />,
			route: Routes.Transactions,
		},
		{ id: "nav-categories", text: t("nav.private.categories"), icon: <PeopleRoundedIcon />, route: Routes.Categories },
		{ id: "nav-settings", text: t("nav.private.settings"), icon: <SettingsRoundedIcon />, route: Routes.Settings },
	];

	const matchRoutes = (route: Routes): boolean => {
		const matches = useMatch(route);

		return !!matches;
	};

	return (
		<Stack sx={{ flexGrow: 1, justifyContent: "space-between" }}>
			<List dense>
				{mainListItems.map((item) => (
					<Fragment key={item.id}>
						{item.id === "nav-settings" && <Divider sx={{ my: 2, border: 0.5 }} />}
						<ListItem
							disablePadding
							sx={{ display: "block" }}
						>
							<ListItemButton
								selected={matchRoutes(item.route)}
								component={Link}
								to={item.route}
							>
								<ListItemIcon>{item.icon}</ListItemIcon>
								<ListItemText primary={item.text} />
							</ListItemButton>
						</ListItem>
					</Fragment>
				))}
			</List>
		</Stack>
	);
};
