import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { counterQueue, queueTicket } from '$lib/server/db/schema';
import { eq, isNull, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params }) => {
  const counterId = params.id;
  if (!counterId) return new Response('Counter ID missing', { status: 400 });

  try {
    const [ticket] = await db
      .select({ ticket_number: queueTicket.ticket_number })
      .from(queueTicket)
      .where(
        and(
          eq(queueTicket.counter_id, counterId),
          isNull(queueTicket.served_at)
        )
      )
      .orderBy(queueTicket.printed_at)
      .limit(1);

    if (!ticket) return new Response('No printed tickets to serve', { status: 400 });

    await db
      .update(queueTicket)
      .set({ served_at: new Date() })
      .where(eq(queueTicket.ticket_number, ticket.ticket_number));

    await db
      .update(counterQueue)
      .set({ now_serving: ticket.ticket_number })
      .where(eq(counterQueue.counter_id, counterId));

    return new Response(JSON.stringify({ now_serving: ticket.ticket_number }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Failed to serve next ticket:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};