import * as yup from "yup";

export const TransactionFormSchema = yup.object({
	title: yup.string().max(255, "Title cannot be longer than 255 characters").required("Title is required"),
	description: yup.string().max(500, "Description cannot be longer than 500 characters"),
	amount: yup.number().required("Amount is required"),
	date: yup.date().required("Date is required"), // TODO: if we want to restrict user from setting future date
});

export interface TransactionFormSchemaType extends yup.InferType<typeof TransactionFormSchema> { }
