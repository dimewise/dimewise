import * as yup from "yup";

export const ForgotPasswordSchema = yup.object({
	email: yup.string().email().required("Email is required"),
});

export interface ForgotPasswordSchema extends yup.InferType<typeof ForgotPasswordSchema> {}
