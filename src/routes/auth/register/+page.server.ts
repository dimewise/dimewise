import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AuthError } from '@supabase/supabase-js';
import prisma from '$lib/server/prisma';
import { Currencies } from '@prisma/client';
import { HttpStatusCode } from '$lib/utils/HttpStatusCodes';
import { z } from 'zod';
import { message, setError, superValidate } from 'sveltekit-superforms/server';

const PASSWORD_MIN_LENGTH = 8;
const MIN_HTTP_STATUS_CODE = 400;
const MAX_HTTP_STATUS_CODE = 500;

const validateEmailSchema = z.object({
	email: z.string().email(),
});

const validateMainSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(PASSWORD_MIN_LENGTH),
		confirmPassword: z.string().min(PASSWORD_MIN_LENGTH),
	})
	.superRefine(({ password, confirmPassword }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Passwords do not match',
				path: ['confirmPassword'],
			});
		}
	});

export const load: PageServerLoad = async () => {
	const validateEmailForm = await superValidate(validateEmailSchema);
	const validateMainForm = await superValidate(validateMainSchema);

	return { validateEmailForm, validateMainForm };
};

export const actions: Actions = {
	validateEmail: async ({ request }) => {
		// form validation
		const validateEmailForm = await superValidate(request, validateEmailSchema);

		if (!validateEmailForm.valid) {
			return fail(HttpStatusCode.BadRequest, { success: false, validateEmailForm });
		}

		// further check with database to see if the email is in use
		const email = validateEmailForm.data.email;
		try {
			const user = await prisma.user.findUnique({
				where: {
					email,
				},
			});

			// if user exists, return true, else false
			if (user) {
				return setError(validateEmailForm, 'email', 'err_email_exists');
			} else {
				return message(validateEmailForm, {
					success: true,
					status: HttpStatusCode.OK,
					message: '',
				});
			}
		} catch (e) {
			console.error('Error checking email existence: ', e);
			return message(validateEmailForm, {
				success: false,
				status: HttpStatusCode.InternalServerError,
				message: 'err_internal_server_error',
			});
		}
	},
	register: async ({ request, url, locals: { supabase } }) => {
		// form validation
		const validateMainForm = await superValidate(request, validateMainSchema);

		if (!validateMainForm.valid) {
			return fail(HttpStatusCode.BadRequest, { success: false, validateMainForm });
		}

		// email has already been verified, proceed with supabase registration
		const email = validateMainForm.data.email;
		const password = validateMainForm.data.password;

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: `${url.origin}/auth/callback` },
		});

		if (error) {
			// check bad request coming from supabase
			console.error(error);
			if (
				error instanceof AuthError &&
				error.status != undefined &&
				error.status >= MIN_HTTP_STATUS_CODE &&
				error.status < MAX_HTTP_STATUS_CODE
			) {
				return message(validateMainForm, {
					success: false,
					status: HttpStatusCode.BadRequest,
					message: error.message,
				});
			}

			return message(validateMainForm, {
				success: false,
				status: HttpStatusCode.InternalServerError,
				message: error.message,
			});
		}

		// registration with supabase auth complete, create user in database
		try {
			await prisma.user.create({
				data: {
					email: email,
					authId: data?.user?.id as string,
					defaultCurrency: Currencies.JPY,
				},
			});
		} catch (e) {
			console.error('Error creating user in database: ', e);
			return message(validateMainForm, {
				success: false,
				status: HttpStatusCode.InternalServerError,
				message: 'err_internal_server_error',
			});
		}

		return message(validateMainForm, {
			success: true,
			status: HttpStatusCode.OK,
			message: '',
		});
	},
};
