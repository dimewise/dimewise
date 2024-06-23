import * as yup from "yup";

export const SignUpSchema = yup.object({
	email: yup.string().email().required("Email is required"),
	password: yup.string().required("Password is required"),
	confirmPassword: yup
		.string()
		.required("Password confirmation is required")
		.test("password-match", "Password must match", function (v) {
			return this.parent.password === v;
		}),
});

export interface SignUpSchemaType extends yup.InferType<typeof SignUpSchema> { }
