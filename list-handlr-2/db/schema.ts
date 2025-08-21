import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const listsTable = pgTable("lists", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  index: integer().notNull(),
  list_name: varchar({ length: 255 }).notNull(),
  last_update: timestamp("last_update").notNull().defaultNow(),
  last_item_update: timestamp("last_item_update").notNull().defaultNow(),
});

export const listItemsTable = pgTable("list_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  list_id: integer()
    .notNull()
    .references(() => listsTable.id),
  index: integer().notNull(),
  text: varchar({ length: 255 }).notNull(),
  done: text().notNull(),
  link: varchar({ length: 255 }).notNull(),
});

export const listRelations = relations(listItemsTable, ({ one }) => ({
  list: one(listsTable, {
    fields: [listItemsTable.list_id],
    references: [listsTable.id],
  }),
}));

export const listsRelations = relations(listsTable, ({ many }) => ({
  items: many(listItemsTable),
}));
