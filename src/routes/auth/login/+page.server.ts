import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { HttpStatusCode } from '$lib/utils/HttpStatusCodes';
import { fail, redirect } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';

const validateLoginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const load: PageServerLoad = async ({ parent }) => {
	// check if user is already logged in
	const { session } = await parent();
	if (session) {
		throw redirect(HttpStatusCode.Found, '/dashboard');
	}

	const validateLoginForm = await superValidate(validateLoginSchema);
	return { validateLoginForm };
};

export const actions: Actions = {
	// SSO login can also be done through actions, so no default action is set here
	login: async ({ request, locals: { supabase } }) => {
		// form validation
		const validateLoginForm = await superValidate(request, validateLoginSchema);

		if (!validateLoginForm.valid) {
			return fail(HttpStatusCode.BadRequest, { success: false, validateLoginForm });
		}

		// login with supabase auth
		const email = validateLoginForm.data.email;
		const password = validateLoginForm.data.password;
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error(error);
			if (error instanceof AuthApiError && error.status === HttpStatusCode.BadRequest) {
				return fail(HttpStatusCode.BadRequest, {
					success: false,
					validateLoginForm,
					error: { message: 'err_invalid_login_params' },
				});
			}

			return fail(HttpStatusCode.InternalServerError, {
				success: false,
				validateLoginForm,
				error: { message: 'err_internal_server_error' },
			});
		}
		// success ? redirect to dashboard
		throw redirect(HttpStatusCode.SeeOther, '/dashboard');
	},
};
