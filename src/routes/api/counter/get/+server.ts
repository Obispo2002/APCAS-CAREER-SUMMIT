import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { counterQueue, counter, queueTicket } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const rows = await db
      .select({
        id: counterQueue.counter_id,
        now_serving: counterQueue.now_serving,
        next_number: counterQueue.next_number,
        counter_name: counter.counter_name,
        company: counter.company,
        last_printed_ticket: sql<string>`(
          SELECT ticket_number
          FROM queue_ticket
          WHERE queue_ticket.counter_id = counter_queue.counter_id
          ORDER BY printed_at DESC
          LIMIT 1
        )`,
      })
      .from(counterQueue)
      .innerJoin(counter, eq(counter.id, counterQueue.counter_id))
      .where(eq(counter.user_id, userId))
      .orderBy(sql`counter.counter_name ASC`);
      
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to fetch counter queues:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};