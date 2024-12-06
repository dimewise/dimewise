import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import AppBar from "@mui/material/AppBar";
import Stack from "@mui/material/Stack";
import { tabsClasses } from "@mui/material/Tabs";
import MuiToolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { useSelector } from "react-redux";
import { DimewiseIcon } from "../../../assets/icons/DimewiseIcon";
import type { RootState } from "../../../store";
import { MenuButton } from "../../MenuButton";
import { SideMenuMobile } from "./SideMenuMobile";

const Toolbar = styled(MuiToolbar)({
	width: "100%",
	padding: "12px",
	display: "flex",
	flexDirection: "column",
	alignItems: "start",
	justifyContent: "center",
	gap: "12px",
	flexShrink: 0,
	[`& ${tabsClasses.flexContainer}`]: {
		gap: "8px",
		p: "8px",
		pb: 0,
	},
});

export const DashboardNavbar = () => {
	const mode = useSelector((state: RootState) => state.theme.mode);
	const [open, setOpen] = useState(false);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};

	return (
		<AppBar
			position="fixed"
			sx={{
				display: { xs: "auto", md: "none" },
				boxShadow: 0,
				height: "64px",
				bgcolor: "background.paper",
				backgroundImage: "none",
				borderBottom: "1px solid",
				borderColor: "divider",
			}}
		>
			<Toolbar variant="regular">
				<Stack
					direction="row"
					sx={{
						justifyContent: "space-between",
						alignItems: "center",
						flexGrow: 1,
						width: "100%",
					}}
				>
					<Stack
						direction="row"
						spacing={1}
						sx={{ justifyContent: "center" }}
					>
						<DimewiseIcon
							mode={mode}
							height={30}
							width={130}
						/>
					</Stack>
					<MenuButton
						aria-label="menu"
						onClick={toggleDrawer(true)}
					>
						<MenuRoundedIcon />
					</MenuButton>
					<SideMenuMobile
						open={open}
						toggleDrawer={toggleDrawer}
					/>
				</Stack>
			</Toolbar>
		</AppBar>
	);
};
