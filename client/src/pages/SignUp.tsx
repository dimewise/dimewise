import { XCircleIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import type { AuthError } from "@supabase/supabase-js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Routes } from "../Routes";
import { useAuth } from "../hooks/useAuth";
import { SignUpSchema, type SignUpSchemaType } from "../lib/schemas/SignUpSchema";

export const SignUp = () => {
	const { t } = useTranslation();
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
			<div className="text-center my-10">
				<h1 className="text-3xl font-black">{t("sign_up.title")}</h1>
				<h2>{t("sign_up.greetings")}</h2>
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
						<span className="label-text">{t("auth.form.field_email.label")}</span>
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
						<span className="label-text">{t("auth.form.field_password.label")}</span>
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
						<span className="label-text">{t("auth.form.field_confirm_password.label")}</span>
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
					{t("auth.form.button.sign_up")}
				</button>
				<div className="w-full flex items-center justify-center text-sm gap-2">
					<p>{t("link.already_have_an_account")}</p>
					<Link
						className="link link-primary"
						to={Routes.Login}
					>
						{t("link.sign_in")}
					</Link>
				</div>
			</form>
		</>
	);
};
