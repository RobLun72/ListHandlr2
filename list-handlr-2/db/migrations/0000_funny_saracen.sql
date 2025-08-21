CREATE TABLE "list_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "list_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"list_id" integer NOT NULL,
	"index" integer NOT NULL,
	"text" varchar(255) NOT NULL,
	"done" text NOT NULL,
	"link" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"index" integer NOT NULL,
	"list_name" varchar(255) NOT NULL,
	"last_update" timestamp DEFAULT now() NOT NULL,
	"last_item_update" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE no action ON UPDATE no action;