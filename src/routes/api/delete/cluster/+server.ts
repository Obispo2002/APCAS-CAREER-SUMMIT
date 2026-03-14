import db from '$lib/server/db';
import { user, counter, session } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	try {
		const { userId } = await request.json();
		if (!userId) return new Response(JSON.stringify({ error: 'User ID missing' }), { status: 400 });
		const [existingUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
		if (!existingUser) {
			return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
		}
		await db.transaction(async (tx) => {
			await tx.delete(counter).where(eq(counter.user_id, userId));
			await tx.delete(session).where(eq(session.userId, userId));
			await tx.delete(user).where(eq(user.id, userId));
		});

		return new Response(JSON.stringify({ success: true, message: 'Cluster deleted successfully' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Failed to delete cluster:', error);
		return new Response(JSON.stringify({ error: 'Failed to delete cluster' }), { status: 500 });
	}
}