import * as yup from "yup";

export const TransactionSchema = yup.object({
	title: yup.string().max(255, "Title cannot be longer than 255 characters").required("Title is required"),
	description: yup.string().max(500, "Description cannot be longer than 500 characters"),
	amount: yup.number().required("Amount is required"),
	date: yup.string().required("Date is required"), // TODO: if we want to restrict user from setting future date
	category_id: yup.string().uuid().required("Category is required"),
});

export interface TransactionSchemaType extends yup.InferType<typeof TransactionSchema> {}
