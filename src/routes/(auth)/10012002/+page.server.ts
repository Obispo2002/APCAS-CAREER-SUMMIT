import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { registerSchema } from '$lib/zod-schema';
import { zod } from 'sveltekit-superforms/adapters';
import { hash } from '@node-rs/argon2';
import db from '$lib/server/db/index.js';
import postgres from 'postgres';
import { user } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';

type UserInsert = InferModel<typeof user, 'insert'>;

export const load: PageServerLoad = async () => {
	return {
		registerForm: await superValidate(zod(registerSchema))
	};
};

export const actions: Actions = {
	register: async (event) => {
		const form = await superValidate(event, zod(registerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { username, password } = form.data;

		try {
			const existingUsername = await db
				.select()
				.from(user)
				.where(eq(user.username, username))
				.limit(1);

			if (existingUsername.length > 0) {
				return setError(form, 'username', 'Username already taken');
			}
			const userId = crypto.randomUUID();
			const hashedPassword = await hash(password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});
			const newUser: UserInsert = {
				id: userId,
				username,
				hashedPassword,
				role: 'user' 
			};

			await db.insert(user).values(newUser);

			return {
				success: true,
				message: 'Account created successfully'
			};
		} catch (e) {
			console.error(e);

			if (e instanceof postgres.PostgresError) {
				return setError(form, '', e.message);
			}

			return setError(form, '', 'Unable to create account');
		}
	}
};