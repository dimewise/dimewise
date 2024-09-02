import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useState } from "react";
import { ToggleColorMode } from "../Home/ToggleMode";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { Link } from "react-router-dom";
import { Routes } from "../../Routes";
import { toggleMode } from "../../store/themeSlice";
import { DimewiseIcon } from "../../assets/icons/DimewiseIcon";

export const NavBar = () => {
	const dispatch = useDispatch();
	const [open, setOpen] = useState(false);
	const mode = useSelector((state: RootState) => state.theme.mode);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};

	const handleToggleMode = () => {
		dispatch(toggleMode());
	};

	return (
		<AppBar
			position="fixed"
			sx={{ boxShadow: 0, bgcolor: "transparent", backgroundImage: "none", mt: 4 }}
		>
			<Container
				maxWidth="lg"
				sx={{ display: "flex", width: "100%", alignItems: "center", gap: 2 }}
			>
				<Toolbar
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						flexShrink: 0,
						flex: 1,
						borderRadius: (theme) => `calc(${theme.shape.borderRadius}px + 8px)`,
						backdropFilter: "blur(24px)",
						border: "1px solid",
						borderColor: (theme) => theme.palette.divider,
						backgroundColor: (theme) => alpha(theme.palette.background.default, 0.4),
						boxShadow: (theme) => theme.shadows[1],
						padding: "8px 12px",
					}}
					variant="dense"
					disableGutters
				>
					<Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}>
						<DimewiseIcon mode={mode} />
						<Box sx={{ display: { xs: "none", md: "flex" } }}>
							<Button
								variant="text"
								color="info"
								size="small"
							>
								Features
							</Button>
							<Button
								variant="text"
								color="info"
								size="small"
							>
								Testimonials
							</Button>
							<Button
								variant="text"
								color="info"
								size="small"
							>
								Highlights
							</Button>
							<Button
								variant="text"
								color="info"
								size="small"
							>
								Pricing
							</Button>
							<Button
								variant="text"
								color="info"
								size="small"
								sx={{ minWidth: 0 }}
							>
								FAQ
							</Button>
							<Button
								variant="text"
								color="info"
								size="small"
								sx={{ minWidth: 0 }}
							>
								Blog
							</Button>
						</Box>
					</Box>
					<Box
						sx={{
							display: { xs: "none", md: "flex" },
							gap: 1,
							alignItems: "center",
						}}
					>
						<Button
							component={Link}
							to={Routes.SignIn}
							color="primary"
							variant="text"
							size="small"
						>
							Sign in
						</Button>
						<Button
							component={Link}
							to={Routes.SignUp}
							color="primary"
							variant="contained"
							size="small"
						>
							Sign up
						</Button>
					</Box>
					<Box sx={{ display: { sm: "flex", md: "none" } }}>
						<IconButton
							aria-label="Menu button"
							onClick={toggleDrawer(true)}
						>
							<MenuIcon />
						</IconButton>
						<Drawer
							anchor="top"
							open={open}
							onClose={toggleDrawer(false)}
						>
							<Box sx={{ p: 2, backgroundColor: "background.default" }}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
									}}
								>
									<IconButton onClick={toggleDrawer(false)}>
										<CloseRoundedIcon />
									</IconButton>
								</Box>
								<Divider sx={{ my: 3 }} />
								<MenuItem>Features</MenuItem>
								<MenuItem>Testimonials</MenuItem>
								<MenuItem>Highlights</MenuItem>
								<MenuItem>Pricing</MenuItem>
								<MenuItem>FAQ</MenuItem>
								<MenuItem>Blog</MenuItem>
								<MenuItem>
									<Button
										component={Link}
										to={Routes.SignIn}
										color="primary"
										variant="contained"
										fullWidth
									>
										Sign up
									</Button>
								</MenuItem>
								<MenuItem>
									<Button
										component={Link}
										to={Routes.SignUp}
										color="primary"
										variant="outlined"
										fullWidth
									>
										Sign in
									</Button>
								</MenuItem>
								<MenuItem>
									<ToggleColorMode
										mode={mode}
										toggleColorMode={handleToggleMode}
									/>
								</MenuItem>
							</Box>
						</Drawer>
					</Box>
				</Toolbar>
				<ToggleColorMode
					mode={mode}
					toggleColorMode={handleToggleMode}
					sx={{
						p: 3,
					}}
				/>
			</Container>
		</AppBar>
	);
};
