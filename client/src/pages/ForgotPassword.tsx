import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Routes } from "../Routes";
import { ForgotPasswordSchema } from "../lib/schemas/ForgotPasswordSchema";

// TODO: Complete the forgot password process with emails sent etc
export const ForgotPassword = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordSchema>({
		resolver: yupResolver(ForgotPasswordSchema),
	});

	const onSubmit = (data: ForgotPasswordSchema) => {
		console.log("forgot password, what do", data);
	};

	return (
		<>
			<div className="text-center my-10">
				<h1 className="text-3xl font-black">Forgot Password</h1>
				<h2>Type in your email and we'll send you a link to reset your password</h2>
			</div>
			<form
				className="w-full max-w-sm flex flex-col gap-3"
				onSubmit={handleSubmit(onSubmit)}
			>
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
				<button
					type="submit"
					className="btn btn-primary w-full mt-3"
				>
					Reset Password
				</button>
				<div className="w-full flex items-center justify-center text-sm gap-2">
					<p>Already have an account?</p>
					<Link
						className="link link-primary"
						to={Routes.Login}
					>
						Sign In
					</Link>
				</div>
			</form>
		</>
	);
};
