import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export const PublicLayout = () => {
	return (
		<>
			<NavBar />
			<Outlet />
		</>
	);
};
