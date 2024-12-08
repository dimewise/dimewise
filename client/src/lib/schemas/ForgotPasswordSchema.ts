import { z } from "zod";
import i18n from "../locale/i18n";

export const ForgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: i18n.t("auth.form.field_email.validate_required"),
    })
    .email({
      message: i18n.t("auth.form.field_email.validate_not_an_email"),
    }),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
