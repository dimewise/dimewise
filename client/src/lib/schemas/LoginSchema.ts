import * as yup from "yup";

export const LoginSchema = yup.object({
    email: yup.string().email().required("Email is required"),
    password: yup.string().required("Password is required"),
});

export interface LoginSchemaType extends yup.InferType<typeof LoginSchema> { }
