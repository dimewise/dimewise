import * as yup from "yup";

export const CategorySchema = yup.object({
	name: yup.string().max(255, "Name cannot be longer than 255 characters").required("Name is required"),
	budget: yup.number().required("Budget is required"),
});

export interface CategorySchemaType extends yup.InferType<typeof CategorySchema> {}
