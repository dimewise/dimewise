import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../../store/store";
import { Routes } from "../Routes";

export const Home = () => {
	const user = useSelector((state: RootState) => state.user);

	if (user) {
		return (
			<Navigate
				to={Routes.Dashboard}
				replace
			/>
		);
	}
	return <div>Home page</div>;
};
