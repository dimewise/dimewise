import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { Link as RouterLink } from "react-router-dom";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SitemarkIcon } from "../assets/icons/SitemarkIcon";
import { GoogleIcon } from "../assets/icons/GoogleIcon";
import { FacebookIcon } from "../assets/icons/FacebookIcon";
import { ForgotPasswordDialog } from "../components/SignIn/ForgotPasswordDialog";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Routes } from "../Routes";
import { useAuth } from "../hooks/useAuth";
import { LoginSchema, type LoginSchemaType } from "../lib/schemas/LoginSchema";
import type { AuthError } from "@supabase/supabase-js";
import { Alert, Link } from "@mui/material";

export const SignIn = () => {
	const { login } = useAuth();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);
	const [loginError, setLoginError] = useState<AuthError | null>(null);

	// register form schema
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginSchemaType>({
		resolver: yupResolver(LoginSchema),
	});

	// handle on sign in form submit
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

	// handle forgot password
	const handleClickOpenForgotPasswordDialog = () => {
		setOpenForgotPasswordDialog(true);
	};
	const handleCloseForgotPasswordDialog = () => {
		setOpenForgotPasswordDialog(false);
	};

	return (
		<>
			<SitemarkIcon />
			<Typography
				component="h1"
				variant="h4"
				sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
			>
				Sign in
			</Typography>
			<Box
				component="form"
				onSubmit={handleSubmit(onSubmit)}
				noValidate
				sx={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					gap: 2,
				}}
			>
				{loginError && <Alert severity="error">{loginError.message}</Alert>}
				<FormControl>
					<FormLabel htmlFor="email">{t("auth.form.field_email.label")}</FormLabel>
					<TextField
						error={!!errors.email}
						helperText={errors.email?.message}
						id="email"
						type="email"
						placeholder="your@email.com"
						autoComplete="email"
						autoFocus
						required
						fullWidth
						variant="outlined"
						color={errors.email ? "error" : "primary"}
						sx={{ ariaLabel: "email" }}
						{...register("email")}
					/>
				</FormControl>
				<FormControl>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<FormLabel htmlFor="password">Password</FormLabel>
						<Link
							component="button"
							onClick={handleClickOpenForgotPasswordDialog}
							variant="body2"
							sx={{ alignSelf: "baseline" }}
						>
							Forgot your password?
						</Link>
					</Box>
					<TextField
						error={!!errors.password}
						helperText={errors.password?.message}
						placeholder="••••••"
						type="password"
						id="password"
						autoComplete="current-password"
						required
						fullWidth
						color={errors.password ? "error" : "primary"}
						variant="outlined"
						sx={{ ariaLabel: "password" }}
						{...register("password")}
					/>
				</FormControl>
				<FormControlLabel
					control={
						<Checkbox
							value="remember"
							color="primary"
						/>
					}
					label="Remember me"
				/>
				<ForgotPasswordDialog
					open={openForgotPasswordDialog}
					handleClose={handleCloseForgotPasswordDialog}
				/>
				<Button
					type="submit"
					fullWidth
					variant="contained"
				>
					Sign in
				</Button>
				<Typography sx={{ textAlign: "center" }}>
					Don&apos;t have an account?{" "}
					<span>
						<Link
							component={RouterLink}
							to={Routes.SignUp}
							variant="body2"
							sx={{ alignSelf: "center" }}
						>
							Sign up
						</Link>
					</span>
				</Typography>
			</Box>
			<Divider>or</Divider>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				<Button
					type="submit"
					fullWidth
					variant="outlined"
					onClick={() => alert("Sign in with Google")}
					startIcon={<GoogleIcon />}
				>
					Sign in with Google
				</Button>
				<Button
					type="submit"
					fullWidth
					variant="outlined"
					onClick={() => alert("Sign in with Facebook")}
					startIcon={<FacebookIcon />}
				>
					Sign in with Facebook
				</Button>
			</Box>
		</>
	);
};
