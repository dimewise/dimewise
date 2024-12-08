import { z } from "zod";
import i18n from "../locale/i18n";

export const LoginSchema = z.object({
	email: z
		.string({
			required_error: i18n.t("auth.form.field_email.validate_required"),
		})
		.email({
			message: i18n.t("auth.form.field_email.validate_not_an_email"),
		}),
	password: z
		.string({
			required_error: i18n.t("auth.form.field_password.validate_required"),
		})
		.min(8, i18n.t("auth.form.field_password.validate_minimum_length"))
		.max(64, i18n.t("auth.form.field_password.validate_maximum_length")),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
