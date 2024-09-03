import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import { Routes } from "../../../Routes";
import { Link, useMatch } from "react-router-dom";

interface MenuListItemType {
	id: string;
	text: string;
	icon: JSX.Element;
	route: Routes;
}

const mainListItems: MenuListItemType[] = [
	{ id: "nav-home", text: "Home", icon: <HomeRoundedIcon />, route: Routes.Overview },
	{ id: "nav-transactions", text: "Transactions", icon: <AnalyticsRoundedIcon />, route: Routes.Transactions },
	{ id: "nav-categories", text: "Categories", icon: <PeopleRoundedIcon />, route: Routes.Categories },
];

const secondaryListItems: MenuListItemType[] = [
	{ id: "nav-settings", text: "Settings", icon: <SettingsRoundedIcon />, route: Routes.Settings },
	{ id: "nav-about", text: "About", icon: <InfoRoundedIcon />, route: Routes.About },
	{ id: "nav-feedback", text: "Feedback", icon: <HelpRoundedIcon />, route: Routes.Feedback },
];

export const MenuContent = () => {
	const matchRoutes = (route: Routes): boolean => {
		const matches = useMatch(route);

		return !!matches ?? false;
	};

	return (
		<Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
			<List dense>
				{mainListItems.map((item) => (
					<ListItem
						key={item.id}
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
				))}
			</List>

			<List dense>
				{secondaryListItems.map((item) => (
					<ListItem
						key={item.id}
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
				))}
			</List>
		</Stack>
	);
};
