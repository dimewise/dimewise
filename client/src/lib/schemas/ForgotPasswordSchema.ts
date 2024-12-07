import { z } from "zod";

export const ForgotPasswordSchema = z.object({
	email: z
		.string({
			required_error: "auth.form.field_email.validate_required",
		})
		.email({
			message: "auth.form.field_email.validate_not_an_email",
		}),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
