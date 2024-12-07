import { z } from "zod";

export const SignUpSchema = z
	.object({
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
			.max(64, "auth.form.field_password.validate_maximum_length")
			.regex(/[A-Z]/, "auth.form.field_password.validate_contains_uppercase")
			.regex(/[a-z]/, "auth.form.field_password.validate_contains_lowercase")
			.regex(/[0-9]/, "auth.form.field_password.validate_contains_number")
			.regex(/[\W_]/, "auth.form.field_password.validate_contains_special_character"),
		confirmPassword: z.string({
			required_error: "auth.form.field_confirm_password.validate_required",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "auth.form.field_confirm_password.validate_not_equal_password",
		path: ["confirmPassword"],
	});

export type SignUpFormData = z.infer<typeof SignUpSchema>;
