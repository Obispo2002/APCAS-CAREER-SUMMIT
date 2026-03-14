import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { counterQueue, counter } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateTicketESCPOS } from '$lib/utils';

export const POST: RequestHandler = async ({ request, locals }) => {
  const userId = locals.user?.id;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { counterId } = await request.json();
    if (!counterId) {
      return new Response(JSON.stringify({ error: 'Counter ID required' }), { status: 400 });
    }

    const [queue] = await db
      .select({
        counter_id: counterQueue.counter_id,
        next_number: counterQueue.next_number,
        last_reset: counterQueue.last_reset,
        counter_name: counter.counter_name,
        company: counter.company,
      })
      .from(counterQueue)
      .innerJoin(counter, eq(counter.id, counterQueue.counter_id))
      .where(eq(counterQueue.counter_id, counterId))
      .limit(1);

    if (!queue) {
      return new Response(JSON.stringify({ error: 'Counter not found' }), { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextNumberStr = queue.next_number;
    const lastReset = new Date(queue.last_reset);
    lastReset.setHours(0, 0, 0, 0);

    if (lastReset.getTime() < today.getTime()) {
      nextNumberStr = '1';
    }

    let prefix = queue.company.toUpperCase();
    let numStr = nextNumberStr;
    if (nextNumberStr.includes('_')) {
      [prefix, numStr] = nextNumberStr.split('_');
    }

    let num = Number(numStr);
    if (isNaN(num)) num = 1;

    const ticketNumber = String(num).padStart(4, '0');
    const ticketCode = `${prefix}_${ticketNumber}`;

    const data = generateTicketESCPOS({
      company: queue.company,
      ticketCode,
      counterName: queue.counter_name,
      timestamp: new Date()
    });

    // Return ticket info to frontend only, no DB insert
    return new Response(
      JSON.stringify({
        data,
        ticketCode,
        counterId,
        nextNumber: num + 1,
        prefix
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Failed to generate ticket:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};