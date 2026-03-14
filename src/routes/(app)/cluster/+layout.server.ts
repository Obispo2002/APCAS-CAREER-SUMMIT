import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.user;

	if (!user || user.role !== 'user') {
		throw redirect(302, '/login');
	}
	return {
		user: {
			username: user.username,
			role: user.role
		}
	};
};
