import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AuthError } from '@supabase/supabase-js';
import prisma from '$lib/server/prisma';
import { Currencies } from '@prisma/client';
import { HttpStatusCode } from '$lib/utils/HttpStatusCodes';
import { z } from 'zod';
import { message, setError, superValidate } from 'sveltekit-superforms/server';

const validateEmailSchema = z.object({
	email: z.string().email(),
});

const validateMainSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(8),
		confirmPassword: z.string().min(8),
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

export const load = async () => {
	const validateEmailForm = await superValidate(validateEmailSchema);
	const validateMainForm = await superValidate(validateMainSchema);

	return { validateEmailForm, validateMainForm };
};

export const actions: Actions = {
	validateEmail: async ({ request }) => {
		const validateEmailForm = await superValidate(request, validateEmailSchema);

		if (!validateEmailForm.valid) return fail(HttpStatusCode.BadRequest, { success: false, validateEmailForm });

		// Check if email is already in use
		const email = validateEmailForm.data.email;
		try {
			const user = await prisma.user.findUnique({
				where: {
					email,
				},
			});

			// if user exists, return true, else false
			if (user) {
				return setError(validateEmailForm, 'email', 'Email already exists');
			} else {
				return message(validateEmailForm, {
					success: true,
					status: HttpStatusCode.OK,
					message: 'Email available',
				});
			}
		} catch (e) {
			console.error('Error checking email existence: ', e);
			return message(validateEmailForm, {
				success: false,
				status: HttpStatusCode.InternalServerError,
				message: 'Error checking email existence',
			});
		}
	},
	// TODO: update register func once finish setting up register page
	register: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		// TODO: add validaiton checks for email and password?
		// check if is valid email address
		// check if email is already in use
		// check if password is strong enough

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: `${url.origin}/auth/callback` },
		});

		if (error) {
			if (error instanceof AuthError && error.status != undefined && error.status >= 400 && error.status < 500) {
				return fail(HttpStatusCode.BadRequest, {
					email,
					message: error.message,
					success: false,
				});
			}

			return fail(HttpStatusCode.InternalServerError, {
				email,
				message: error.message,
				success: false,
			});
		}

		try {
			await prisma.user.create({
				data: {
					email: email,
					authId: data?.user?.id as string,
					defaultCurrency: Currencies.JPY,
				},
			});
		} catch (e) {
			console.log(e);
		}

		return {
			message: 'Should be good to go, please try signing in since email confirmation has been disabled',
			success: true,
		};
	},
};
