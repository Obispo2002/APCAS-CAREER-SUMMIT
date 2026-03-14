import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { clusterSchema, updateClusterSchema } from '$lib/zod-schema';
import { zod } from 'sveltekit-superforms/adapters';
import { hash } from '@node-rs/argon2';
import db from '$lib/server/db/index.js';
import { user } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';

type UserInsert = InferModel<typeof user, 'insert'>;

export const load: PageServerLoad = async ({ depends }) => {
	depends('refetch:cluster');

	// Fetch all employees sorted by username (Postgres safe)
	const employees = await db
		.select({
			id: user.id,
			username: user.username,
			cluster_name: user.cluster_name,
			role: user.role
		})
		.from(user)
		.where(eq(user.role, 'user'))
		.orderBy(sql`${user.username} ASC`);

	return {
		loginForm: await superValidate(zod(clusterSchema)),
		updateEmployeeForm: await superValidate(zod(updateClusterSchema)),
		employees
	};
};

export const actions: Actions = {
		employee: async (event) => {
		const form = await superValidate(event, zod(clusterSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const [lastUser] = await db
				.select({ username: user.username })
				.from(user)
				.where(sql`${user.username} LIKE 'APCAS_%'`)
				.orderBy(sql`${user.username} DESC`)
				.limit(1);

			let counter = 1;
			if (lastUser) {
				const lastNumber = parseInt(lastUser.username.split('_')[1], 10);
				if (!isNaN(lastNumber)) counter = lastNumber + 1;
			}

			const userName = `APCAS_${String(counter).padStart(3, '0')}`;
			const userId = crypto.randomUUID();
			const hashedPassword = await hash(form.data.hashed_password);

			await db.insert(user).values({
				id: userId,
				username: userName,
				cluster_name: form.data.cluster_name,
				hashedPassword,
				role: 'user'
			});
			return {
				success: true,
				user: {
					id: String(userId),      
					username: userName,
					cluster_name: form.data.cluster_name ?? null,
					role: 'user'
				}
			};
		} catch (error) {
			console.error('Failed to create user:', error);
			return fail(500, { form });
		}
	},

	updateCluster: async (event) => {
	const form = await superValidate(event, zod(updateClusterSchema));
	if (!form.valid) return fail(400, { form });

	const { userId, hashed_password, cluster_name } = form.data;

	if (!userId) {
		return fail(400, { message: 'Invalid user ID' });
	}

	try {
		const updateData: Partial<UserInsert> = {};

		if (cluster_name) updateData.cluster_name = cluster_name;
		if (hashed_password) updateData.hashedPassword = await hash(hashed_password);

		if (Object.keys(updateData).length === 0) {
			return fail(400, { message: 'Nothing to update' });
		}

		await db.update(user).set(updateData).where(eq(user.id, userId));

		return {
			success: true,
			message: 'Cluster updated successfully'
		};
	} catch (error) {
		console.error('Failed to update cluster:', error);

		return fail(500, {
			message: 'Failed to update cluster'
		});
	}
}
};