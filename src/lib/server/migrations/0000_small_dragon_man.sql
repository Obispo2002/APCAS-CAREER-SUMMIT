DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "counter" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"counter_name" text NOT NULL,
	"company" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "counter_queue" (
	"counter_id" text PRIMARY KEY NOT NULL,
	"now_serving" text NOT NULL,
	"next_number" text NOT NULL,
	"last_reset" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queue_ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"counter_id" text,
	"ticket_number" text NOT NULL,
	"printed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"served_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"cluster_name" text,
	"hashed_password" text NOT NULL,
	"user_role" "user_role" DEFAULT 'user' NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_cluster_name_unique" UNIQUE("cluster_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "counter" ADD CONSTRAINT "counter_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "counter_queue" ADD CONSTRAINT "counter_queue_counter_id_counter_id_fk" FOREIGN KEY ("counter_id") REFERENCES "public"."counter"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "queue_ticket" ADD CONSTRAINT "queue_ticket_counter_id_counter_id_fk" FOREIGN KEY ("counter_id") REFERENCES "public"."counter"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
