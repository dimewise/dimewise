import { z } from "zod";

export const LoginSchema = z.object({
	email: z
		.string({
			required_error: "auth.form.field_email.validate_required",
		})
		.email({
			message: "auth.form.field_email.validate_not_an_email",
		}),
	password: z
		.string({
			required_error: "auth.form.field_password.validate_required",
		})
		.min(8, "auth.form.field_password.validate_minimum_length")
		.max(64, "auth.form.field_password.validate.maximum_length"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
