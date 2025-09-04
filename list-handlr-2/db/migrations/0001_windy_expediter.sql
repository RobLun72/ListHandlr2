CREATE TABLE "lists_collaborations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lists_collaborations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"list_id" integer NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "lists_collaborations" ADD CONSTRAINT "lists_collaborations_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE no action ON UPDATE no action;