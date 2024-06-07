import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../../../store/features/auth";
import type { AppDispatch } from "../../../store/store";
import type { User } from "../../../types/user";

export const Login = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch<AppDispatch>();

	const from = location.state?.from?.pathname || "/";

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const userData: User = { name: formData.get("username") as string };

		dispatch(login(userData));
		navigate(from, { replace: true });
	};

	return (
		<div>
			<p>You must log in to view the page at {from}</p>

			<form onSubmit={handleSubmit}>
				<label>
					Username:{" "}
					<input
						name="username"
						type="text"
					/>
				</label>{" "}
				<button type="submit">Login</button>
			</form>
		</div>
	);
};
