import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { counterSchema } from '$lib/zod-schema';
import { zod } from 'sveltekit-superforms/adapters';
import db from '$lib/server/db/index.js';
import { user, counter } from '$lib/server/db/schema.js';
import crypto from 'crypto';
import { eq, not } from 'drizzle-orm';
export const load: PageServerLoad = async ({ depends }) => {
    depends('refetch:counter');
    const counters = await db
        .select({
            id: counter.id,
            user_id: counter.user_id,
            counter_name: counter.counter_name,
            company: counter.company
        })
        .from(counter);
    const users = await db
        .select({
            id: user.id,
            role: user.role
        })
        .from(user)
        .where(not(eq(user.role, 'admin')));
    return {
        counterForm: await superValidate(zod(counterSchema)),
        counters,
        users
    };
};
export const actions: Actions = {
	addCounter: async (event) => {
		const form = await superValidate(event, zod(counterSchema));
		if (!form.valid) return fail(400, { form });

		const { counter_name, company, userId } = form.data;

		try {
			const counterId = crypto.randomUUID();

			await db.insert(counter).values({
				id: counterId,
				user_id: userId,
				counter_name,
				company
			});
			return { success: true, message: 'Counter added successfully!' };
		} catch (error) {
			console.error(error);
			return setError(form, '', 'Failed to add counter');
		}
	}
};