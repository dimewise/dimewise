import { Navigate } from "react-router-dom";
import { Routes } from "../Routes";
import { useAuth } from "../hooks/useAuth";
import { Box, Divider } from "@mui/material";
import { NavBar } from "../components/Home/NavBar";
import { Hero } from "../components/Home/Hero";
import { LogoCollection } from "../components/Home/LogoCollection";
import { Features } from "../components/Home/Features";
import { Testimonials } from "../components/Home/Testimonials";
import { Highlights } from "../components/Home/Highlights";
import { Pricing } from "../components/Home/Pricing";
import { FAQ } from "../components/Home/FAQ";
import { Footer } from "../components/Home/Footer";

export const Home = () => {
	const { user } = useAuth();

	if (user) {
		return (
			<Navigate
				to={Routes.Dashboard}
				replace
			/>
		);
	}
	return (
		<Box>
			<NavBar />
			<Hero />
			<div>
				<LogoCollection />
				<Features />
				<Divider />
				<Testimonials />
				<Divider />
				<Highlights />
				<Divider />
				<Pricing />
				<Divider />
				<FAQ />
				<Divider />
				<Footer />
			</div>
		</Box>
	);
};
