import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.user;

	if (!user) {
		return {
			user: null
		};
	}

	return {
		user: {
			username: user.username,
			role: user.role
		}
	};
};
