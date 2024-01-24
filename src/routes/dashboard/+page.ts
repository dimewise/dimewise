import { HttpStatusCode } from '$lib/utils/HttpStatusCodes';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ parent }) => {
	const { session } = await parent();
	if (!session) {
		return {
			status: HttpStatusCode.SeeOther,
			redirect: '/login',
		};
	}
	// it is possible to add more info here since it is a load function
	// e.g. do a db query to add more context to the page
	return {
		user: session.user,
	};
};
