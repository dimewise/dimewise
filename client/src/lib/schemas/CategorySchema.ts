import { z } from "zod";
import i18n from "../locale/i18n";

export const CategorySchema = z.object({
	name: z
		.string({
			required_error: i18n.t("categories.form.field_name.validate_required"),
		})
		.max(255, i18n.t("categories.form.field_name.validate_maximum_length")),
	budget: z.coerce
		.number({
			required_error: i18n.t("categories.form.field_budget.validate_required"),
		})
		.min(1, i18n.t("categories.form.field_budget.validate_minimum_value")),
});

export type CategoryFormData = z.infer<typeof CategorySchema>;
