import { Outlet, useNavigate } from "react-router-dom";
import { Routes } from "../../app/Routes";

export const PublicLayout = () => {
	const navigate = useNavigate();
	const handleOnClickLogin = () => {
		navigate(Routes.Login);
	};
	return (
		<div>
			<div className="w-full flex justify-between items-center px-5">
				<div>Dimewise</div>
				<button
					className="btn btn-primary"
					type="button"
					onClick={handleOnClickLogin}
				>
					Login
				</button>
			</div>
			<Outlet />
		</div>
	);
};
