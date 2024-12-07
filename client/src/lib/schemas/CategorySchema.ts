import { z } from "zod";

export const CategorySchema = z.object({
	name: z
		.string({
			required_error: "categories.form.field_name.validate_required",
		})
		.max(255, "categories.form.field_name.validate_maximum_length"),
	budget: z
		.number({
			required_error: "categories.form.field_budget.validate_required",
		})
		.min(1, "categories.form.field_budget.validate_minimum_value"),
});

export type CategoryFormData = z.infer<typeof CategorySchema>;
