import { z } from "zod";
import { Currencies } from "../../types/currency";
import i18n from "../locale/i18n";

export const SignUpSchema = z
  .object({
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
      .max(64, i18n.t("auth.form.field_password.validate_maximum_length"))
      .regex(/[A-Z]/, i18n.t("auth.form.field_password.validate_contains_uppercase"))
      .regex(/[a-z]/, i18n.t("auth.form.field_password.validate_contains_lowercase"))
      .regex(/[0-9]/, i18n.t("auth.form.field_password.validate_contains_number"))
      .regex(/[\W_]/, i18n.t("auth.form.field_password.validate_contains_special_character")),
    confirmPassword: z.string({
      required_error: i18n.t("auth.form.field_confirm_password.validate_required"),
    }),
    default_currency: z.nativeEnum(Currencies, {
      required_error: i18n.t("auth.form.field_default_currency.validate_required"),
      invalid_type_error: i18n.t("auth.form.field_default_currency.validate_invalid"),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: i18n.t("auth.form.field_confirm_password.validate_not_equal_password"),
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof SignUpSchema>;
