import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { counterSchema } from '$lib/zod-schema';
import { zod } from 'sveltekit-superforms/adapters';
import db from '$lib/server/db/index.js';
import { counter, user } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const load: PageServerLoad = async ({ depends, locals }) => {
	depends('refetch:counter');

	const currentUser = locals.user;

	const counters = await db
		.select({
			id: counter.id,
			user_id: counter.user_id,
			counter_name: counter.counter_name,
			company: counter.company,
			username: user.username,
			role: user.role
		})
		.from(counter)
		.leftJoin(user, eq(counter.user_id, user.id))
		.where(eq(user.role, 'user'));

	const users = await db
		.select({
			id: user.id,
			username: user.username,
			cluster_name: user.cluster_name,
			role: user.role
		})
		.from(user);
	let userCounter = null;

	if (currentUser?.id && currentUser.role === 'user') {
		const result = await db
			.select({
				id: counter.id,
				counter_name: counter.counter_name,
				company: counter.company
			})
			.from(counter)
			.where(eq(counter.user_id, currentUser.id));

		userCounter = result[0] ?? null;
	}

	return {
		counterForm: await superValidate(zod(counterSchema)),
		counters,
		users,
		userCounter
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

			return {
				success: true,
				message: 'Counter added successfully!'
			};
		} catch (error) {
			console.error(error);
			return setError(form, '', 'Failed to add counter');
		}
	}
};