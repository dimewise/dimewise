import { Navigate } from "react-router-dom";
import { useAuth } from "../../components/context/AuthContext";
import { Routes } from "../Routes";

export const Home = () => {
	const auth = useAuth();

	if (auth.user) {
		return (
			<Navigate
				to={Routes.Dashboard}
				replace
			/>
		);
	}
	return <div>Home page</div>;
};
