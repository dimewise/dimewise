import { XCircleIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import type { AuthError } from "@supabase/supabase-js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Routes } from "../Routes";
import { SignUpSchema, type SignUpSchemaType } from "../lib/schemas/SignUpSchema";

export const SignUp = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { register: signUp } = useAuth();
	const [signUpError, setsignUpError] = useState<AuthError | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpSchemaType>({
		resolver: yupResolver(SignUpSchema),
	});

	const from = location.state?.from?.pathname || "/";
	const onSubmit = (data: SignUpSchemaType) => {
		signUp(data).then((error) => {
			if (error) {
				setsignUpError(error);
			} else {
				navigate(from, { replace: true });
			}
		});
	};

	return (
		<>
			<div className="flex flex-col items-center justify-start w-full h-full">
				<nav className="navbar w-full max-w-7xl h-navbar flex justify-between items-center px-5 flex-none fixed top-0 left-0">
					<h1 className="font-black text-2xl">
						Dimewise<span className="text-primary">.</span>
					</h1>
				</nav>
				<div className="w-full flex-1 flex flex-col items-center justify-center">
					<div className="text-center my-10">
						<h1 className="text-3xl font-black">Create an account</h1>
						<h2>Start taking control of your finances</h2>
					</div>
					<form
						className="w-full max-w-sm flex flex-col gap-3"
						onSubmit={handleSubmit(onSubmit)}
					>
						{signUpError && (
							<div
								role="alert"
								className="alert alert-error"
							>
								<XCircleIcon className="size-6 text-base-100" />
								<span>{signUpError.status}</span>
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
						<label className="form-control w-full">
							<div className="label">
								<span className="label-text">Confirm Password</span>
							</div>
							<input
								type="password"
								placeholder="******"
								className="input input-bordered w-full"
								{...register("confirmPassword")}
							/>
							{errors?.confirmPassword && (
								<div className="label text-error text-sm">
									<span>{errors.confirmPassword.message}</span>
								</div>
							)}
						</label>
						<button
							type="submit"
							className="btn btn-primary w-full mt-3"
						>
							Sign Up
						</button>
						<div className="w-full flex items-center justify-center text-sm gap-2">
							<p>Already have an account?</p>
							<Link
								className="link link-primary"
								to={Routes.SignUp}
							>
								Sign In
							</Link>
						</div>
					</form>
				</div>
			</div>
			<div className="w-full h-full bg-primary hidden lg:flex" />
		</>
	);
};
