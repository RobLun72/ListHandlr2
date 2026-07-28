CREATE TABLE "driving_journal_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "driving_journal_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"list_id" integer NOT NULL,
	"index" integer NOT NULL,
	"start_odometer" varchar(255) NOT NULL,
	"end_odometer" varchar(255) NOT NULL,
	"distance" integer NOT NULL,
	"notes" text,
	"item_date" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "list_type" varchar(50) DEFAULT 'SortableList' NOT NULL;--> statement-breakpoint
ALTER TABLE "driving_journal_items" ADD CONSTRAINT "driving_journal_items_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE no action ON UPDATE no action;