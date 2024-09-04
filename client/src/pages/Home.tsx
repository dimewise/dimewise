import { Divider } from "@mui/material";
import { Navigate } from "react-router-dom";
import { Routes } from "../Routes";
import { FAQ } from "../components/Home/FAQ";
import { Features } from "../components/Home/Features";
import { Footer } from "../components/Home/Footer";
import { Hero } from "../components/Home/Hero";
import { Highlights } from "../components/Home/Highlights";
import { LogoCollection } from "../components/Home/LogoCollection";
import { Pricing } from "../components/Home/Pricing";
import { Testimonials } from "../components/Home/Testimonials";
import { useAuth } from "../hooks/useAuth";

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
		<>
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
		</>
	);
};
