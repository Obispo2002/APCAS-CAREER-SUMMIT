import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { counterSchemaClient, updateCounterSchema } from '$lib/zod-schema';
import { zod } from 'sveltekit-superforms/adapters';
import db from '$lib/server/db/index.js';
import { counter, counterQueue } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('refetch:counter');

	const userId = locals.user?.id;
	if (!userId) return { counters: [], counterForm: null, updateCounterForm: null };

	const counters = await db
		.select({
			id: counter.id,
			user_id: counter.user_id,
			counter_name: counter.counter_name,
			company: counter.company
		})
		.from(counter)
		.where(eq(counter.user_id, userId))
		.orderBy(sql`${counter.counter_name} ASC`);

	return {
		counterForm: await superValidate(zod(counterSchemaClient)),
		updateCounterForm: await superValidate(zod(updateCounterSchema)),
		counters
	};
};

export const actions: Actions = {
	createCounter: async (event) => {
	const user = event.locals.user;
	if (!user?.id) return fail(401, { message: 'Unauthorized' });

	const form = await superValidate(event, zod(counterSchemaClient));
	if (!form.valid) return fail(400, { form });

	try {
		const newCounterId = crypto.randomUUID();

		await db.insert(counter).values({
			id: newCounterId,
			user_id: user.id,
			counter_name: form.data.counter_name,
			company: form.data.company
		});

		const companyPrefix = form.data.company.replace(/\s+/g, '').toUpperCase();

		await db.insert(counterQueue).values({
			counter_id: newCounterId,
			now_serving: `${companyPrefix}_0001`,
			next_number: `${companyPrefix}_0002`,
			last_reset: new Date() 
		});

		return { success: true };
	} catch (error) {
		console.error('Create counter error:', error);
		return fail(500, { form });
	}
},
	updateCounter: async (event) => {
		const form = await superValidate(event, zod(updateCounterSchema));
		if (!form.valid) return fail(400, { form });

		const { id, counter_name, company } = form.data;
		if (!id) return fail(400, { message: 'Counter ID missing' });

		try {
			const updateData: Partial<typeof counter> = {};
			if (counter_name) updateData.counter_name = counter_name;
			if (company) updateData.company = company;

			if (Object.keys(updateData).length === 0) return fail(400, { message: 'Nothing to update' });

			await db.update(counter).set(updateData).where(eq(counter.id, id));

			return { success: true, form: form.data };
		} catch (error) {
			console.error('Update counter error:', error);
			return fail(500, { form });
		}
	},

	deleteCounter: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Counter ID missing' });

		try {
			await db.delete(counter).where(eq(counter.id, id));
			return { success: true };
		} catch (error) {
			console.error('Delete counter error:', error);
			return fail(500, { message: 'Failed to delete counter' });
		}
	}
};