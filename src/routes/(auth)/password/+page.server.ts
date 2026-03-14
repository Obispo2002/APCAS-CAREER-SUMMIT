import type { Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { hash, verify } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import { superValidate, setError } from 'sveltekit-superforms';
import { changePasswordSchema } from '$lib/zod-schema';
import { zod } from 'sveltekit-superforms/adapters';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
	changePassword: async (event) => {
		
		const form = await superValidate(event, zod(changePasswordSchema));

		
		if (!form.valid) {
			return fail(400, { form });
		}

		
		const { currentPassword, newPassword } = form.data;

		try {
			
			const userId = event.locals.user?.id;
			if (!userId) {
				
				return setError(form, '', 'User not authenticated');
			}

			
			const userData = await db
				.select({ hashedPassword: user.hashedPassword })
				.from(user)
				.where(eq(user.id, userId))
				.limit(1);

			
			if (!userData || userData.length === 0 || !userData[0].hashedPassword) {
				return setError(form, '', 'User not found');
			}

			
			const isPasswordValid = await verify(userData[0].hashedPassword, currentPassword as string);
			if (!isPasswordValid) {
				
				return setError(form, 'currentPassword', 'Current password is incorrect');
			}

			
			const newHashedPassword = await hash(newPassword as string, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1,
			});

			
			await db
				.update(user)
				.set({ hashedPassword: newHashedPassword })
				.where(eq(user.id, userId));

			
			return { success: true, message: 'Password changed successfully' };

		} catch (e) {
			
			console.error('Error changing password:', e);
			return setError(form, '', 'Unable to change password');
		}
	},
};
