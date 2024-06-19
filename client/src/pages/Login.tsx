import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginSchema, type LoginSchemaType } from "../lib/schemas/LoginSchema";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router-dom";

export const Login = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();
	const [loginError, setLoginError] = useState<AuthError | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginSchemaType>({
		resolver: yupResolver(LoginSchema),
	});

	const from = location.state?.from?.pathname || "/";
	const onSubmit = (data: LoginSchemaType) => {
		login(data).then((error) => {
			if (error) {
				setLoginError(error);
			} else {
				navigate(from, { replace: true });
			}
		});
	};

	return (
		<>
			<div className="flex flex-col items-center justify-start w-full h-full">
				<nav className="navbar w-full max-w-7xl h-navbar flex justify-between items-center px-5 flex-none">
					<h1 className="font-black text-2xl">
						Dimewise<span className="text-primary">.</span>
					</h1>
				</nav>
				<div className="w-full flex-1 flex flex-col items-center justify-center">
					<form
						className="w-full max-w-sm flex flex-col gap-3"
						onSubmit={handleSubmit(onSubmit)}
					>
						{loginError && (
							<div
								role="alert"
								className="alert alert-error"
							>
								<XCircleIcon className="size-6 text-base-100" />
								<span>{loginError.status}</span>
							</div>
						)}
						<label className="form-control w-full">
							<div className="label">
								<span className="label-text">Email</span>
							</div>
							<input
								type="email"
								placeholder="john.doe@email.com"
								className="input input-bordered w-full"
								{...register("email")}
							/>
							{errors?.email && (
								<div className="label text-error text-sm">
									<span>{errors.email.message}</span>
								</div>
							)}
						</label>
						<div>
							<label className="form-control w-full">
								<div className="label">
									<span className="label-text">Password</span>
								</div>
								<input
									type="password"
									placeholder="******"
									className="input input-bordered w-full"
									{...register("password")}
								/>
								{errors?.password && (
									<div className="label text-error text-sm">
										<span>{errors.password.message}</span>
									</div>
								)}
							</label>
							<div className="w-full flex items-center justify-end">
								<button
									type="button"
									className="btn btn-xs btn-link"
								>
									Forgot Password?
								</button>
							</div>
						</div>
						<button
							type="submit"
							className="btn btn-primary w-full mt-3"
						>
							Login
						</button>
					</form>
				</div>
			</div>
			<div className="w-full h-full bg-primary hidden lg:flex" />
		</>
	);
};
