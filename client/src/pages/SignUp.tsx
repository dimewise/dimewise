import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, InputLabel, MenuItem, Select } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { AuthError } from "@supabase/supabase-js";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Routes } from "../Routes";
import { DimewiseIcon } from "../assets/icons/DimewiseIcon";
import { FacebookIcon } from "../assets/icons/FacebookIcon";
import { GoogleIcon } from "../assets/icons/GoogleIcon";
import { useAuth } from "../hooks/useAuth";
import { type SignUpFormData, SignUpSchema } from "../lib/schemas/SignUpSchema";
import { useApiV1UserRegisterCreateUserMutation } from "../services/api/v1";
import type { RootState } from "../store";
import { Currencies, getCurrencyForLocale } from "../types/currency";

export const SignUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const assumedCurrency = getCurrencyForLocale(navigator.language);
  const mode = useSelector((state: RootState) => state.theme.mode);
  const { register: signUp } = useAuth();
  const [signUpError, setsignUpError] = useState<AuthError | null>(null);
  const [registerUser] = useApiV1UserRegisterCreateUserMutation();

  // register form schema
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: undefined,
      password: undefined,
      confirmPassword: undefined,
      default_currency: assumedCurrency,
    },
    resolver: zodResolver(SignUpSchema),
  });

  // handle on sign up form submit
  const from = location.state?.from?.pathname || "/";
  const onSubmit = async (creds: SignUpFormData) => {
    signUp(creds, creds.default_currency).then((resp) => {
      if (!resp) return;
      const { userCreate, error } = resp;
      if (error) {
        setsignUpError(error);
      } else {
        registerUser({ userCreate }).then(() => {
          navigate(from, { replace: true });
        });
      }
    });
  };

  return (
    <>
      <DimewiseIcon mode={mode} />
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Sign up
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {signUpError && <Alert severity="error">{signUpError.message}</Alert>}
        <FormControl>
          <FormLabel htmlFor="name">{t("auth.form.field_email.label")}</FormLabel>
          <TextField
            required
            fullWidth
            id="email"
            placeholder="your@email.com"
            autoComplete="email"
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email?.message}
            color={errors.email ? "error" : "primary"}
            {...register("email")}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="password">{t("auth.form.field_password.label")}</FormLabel>
          <TextField
            required
            fullWidth
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="new-password"
            variant="outlined"
            error={!!errors.password}
            helperText={errors.password?.message}
            color={errors.password ? "error" : "primary"}
            {...register("password")}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="confirm-password">{t("auth.form.field_confirm_password.label")}</FormLabel>
          <TextField
            required
            fullWidth
            placeholder="••••••"
            type="password"
            id="confirm-password"
            autoComplete="new-password"
            variant="outlined"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            color={errors.confirmPassword ? "error" : "primary"}
            {...register("confirmPassword")}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="default_currency">{t("auth.form.field_default_currency.label")}</FormLabel>
          <Controller
            control={control}
            name="default_currency"
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <>
                  <Select
                    notched
                    {...field}
                    variant="outlined"
                  >
                    {Object.values(Currencies).map((c) => (
                      <MenuItem
                        key={c}
                        value={c}
                      >
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              );
            }}
          />
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              value="allowExtraEmails"
              color="primary"
            />
          }
          label="I want to receive updates via email."
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
        >
          Sign up
        </Button>
        <Typography sx={{ textAlign: "center" }}>
          Already have an account?{" "}
          <span>
            <Link
              component={RouterLink}
              to={Routes.SignIn}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Sign in
            </Link>
          </span>
        </Typography>
      </Box>
      <Divider>
        <Typography sx={{ color: "text.secondary" }}>or</Typography>
      </Divider>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          type="submit"
          fullWidth
          variant="outlined"
          onClick={() => alert("Sign up with Google")}
          startIcon={<GoogleIcon />}
        >
          Sign up with Google
        </Button>
        <Button
          type="submit"
          fullWidth
          variant="outlined"
          onClick={() => alert("Sign up with Facebook")}
          startIcon={<FacebookIcon />}
        >
          Sign up with Facebook
        </Button>
      </Box>
    </>
  );
};
