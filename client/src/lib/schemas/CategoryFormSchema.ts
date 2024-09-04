import * as yup from "yup";

export const CategoryFormSchema = yup.object({
	name: yup
		.string()
		.max(255, "Category name cannot be longer than 255 characters")
		.required("Category name is required"),
	budget: yup.number().required("Budget is required"),
});

export interface CategoryFormSchemaType extends yup.InferType<typeof CategoryFormSchema> { }
