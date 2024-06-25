import { XCircleIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import type { AuthError } from "@supabase/supabase-js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Routes } from "../Routes";
import { useAuth } from "../hooks/useAuth";
import { LoginSchema, type LoginSchemaType } from "../lib/schemas/LoginSchema";

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
			<div className="text-center my-10">
				<h1 className="text-3xl font-black">Welcome back</h1>
				<h2>Sign in to continue to Dimewise</h2>
			</div>
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
					<div className="w-full flex items-center justify-end text-sm mt-2">
						<Link
							className="link link-primary"
							to={Routes.ForgotPassword}
						>
							Forgot Password?
						</Link>
					</div>
				</div>
				<button
					type="submit"
					className="btn btn-primary w-full mt-3"
				>
					Login
				</button>
				<div className="w-full flex items-center justify-center text-sm gap-2">
					<p>Don't have an account?</p>
					<Link
						className="link link-primary"
						to={Routes.SignUp}
					>
						Sign Up Now
					</Link>
				</div>
			</form>
		</>
	);
};
