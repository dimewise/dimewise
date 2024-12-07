import { DateTime } from "luxon";
import { z } from "zod";

export const TransactionSchema = z.object({
	title: z
		.string({
			required_error: "transaction.form.field_title.validate_required",
		})
		.max(255, "transaction.form.field_title.validate_maximum_length"),
	description: z
		.string({
			required_error: "transaction.form.field_description.validate_required",
		})
		.max(500, "transaction.form.field_description.validate_maximum_length"),
	amount: z.coerce
		.number({
			required_error: "transaction.form.field_amount.validate_required",
		})
		.min(1, "transaction.form.field_amount.validate_minimum_value"),
	date: z.coerce
		.date({
			required_error: "transaction.form.field_date.validate_required",
		})
		.refine(
			(value) => {
				const date = DateTime.fromJSDate(value);
				return date.isValid;
			},
			{
				message: "transaction.form.field_date.validate_invalid_date_format",
			},
		)
		.refine(
			(value) => {
				const date = DateTime.fromJSDate(value);
				return date <= DateTime.now();
			},
			{
				message: "transaction.form.field_date.validate_no_future_date",
			},
		),
	category_id: z
		.string({
			required_error: "transaction.form.field_category_id.validate_required",
		})
		.refine(
			(value) => {
				return value !== "";
			},
			{
				message: "transaction.form.field_category_id.validate_no_category_selected",
			},
		),
});

export type TransactionFormData = z.infer<typeof TransactionSchema>;
