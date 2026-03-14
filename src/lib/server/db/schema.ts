import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

const userRoles = ['admin', 'user'] as const;
export type UserRole = (typeof userRoles)[number];
export const userRole = pgEnum('user_role', userRoles);

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	cluster_name: text('cluster_name').unique(),
	hashedPassword: text('hashed_password').notNull(),
	role: userRole('user_role').default('user').notNull()
});

export const counter = pgTable('counter', {
	id: text('id').primaryKey(),
	user_id: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
	counter_name: text('counter_name').notNull(),
	company: text('company').notNull(),
});

export const counterQueue = pgTable('counter_queue', {
	counter_id: text('counter_id')
		.primaryKey()
		.references(() => counter.id, { onDelete: 'cascade' }),
	now_serving: text('now_serving').notNull(),
	next_number: text('next_number').notNull(),
	last_reset: timestamp('last_reset', { withTimezone: true })
		.defaultNow()
		.notNull()
});
export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const queueTicket = pgTable('queue_ticket', {
  id: text('id').primaryKey(), // unique ticket ID
  counter_id: text('counter_id').references(() => counter.id, { onDelete: 'cascade' }),
  ticket_number: text('ticket_number').notNull(), // e.g., "A_0001" or "0001"
  printed_at: timestamp('printed_at', { withTimezone: true }).defaultNow().notNull(),
  served_at: timestamp('served_at', { withTimezone: true })
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Counter = typeof counter.$inferSelect;
export type CounterQueue = typeof counterQueue.$inferSelect;