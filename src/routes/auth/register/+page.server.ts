import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AuthError } from '@supabase/supabase-js';
import prisma from '$lib/server/prisma';
import { Currencies } from '@prisma/client';
import { HttpStatusCode } from '$lib/utils/HttpStatusCodes';

export const actions: Actions = {
	default: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: `${url.origin}/auth/callback` },
		});

		// TODO: add validaiton checks for email and password?

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
