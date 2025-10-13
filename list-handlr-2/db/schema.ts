import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const listsTable = pgTable("lists", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  index: integer().notNull(),
  list_name: varchar({ length: 255 }).notNull(),
  last_update: timestamp("last_update").notNull().defaultNow(),
  last_item_update: timestamp("last_item_update").notNull().defaultNow(),
  user_id: text(),
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

export const listsCollaborationsTable = pgTable("lists_collaborations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  list_id: integer()
    .notNull()
    .references(() => listsTable.id),
  user_id: text().notNull(),
});

export const collabGroupsTable = pgTable(
  "collab_groups",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    owner_user_id: text().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 500 }),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    ownerNameIdx: uniqueIndex("collab_groups_owner_name_idx").on(
      table.owner_user_id,
      table.name
    ),
  })
);

export const collabGroupMembersTable = pgTable(
  "collab_group_members",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    group_id: integer()
      .notNull()
      .references(() => collabGroupsTable.id, { onDelete: "cascade" }),
    member_user_id: text().notNull(),
    added_at: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => ({
    groupMemberIdx: uniqueIndex("collab_group_members_group_member_idx").on(
      table.group_id,
      table.member_user_id
    ),
  })
);

export const listRelations = relations(listItemsTable, ({ one }) => ({
  list: one(listsTable, {
    fields: [listItemsTable.list_id],
    references: [listsTable.id],
  }),
}));

export const listsRelations = relations(listsTable, ({ many }) => ({
  items: many(listItemsTable),
}));

export const listsCollaborationsRelations = relations(
  listsCollaborationsTable,
  ({ one }) => ({
    list: one(listsTable, {
      fields: [listsCollaborationsTable.list_id],
      references: [listsTable.id],
    }),
  })
);

export const listCollaborationsRelations = relations(
  listsTable,
  ({ many }) => ({
    items: many(listsCollaborationsTable),
  })
);

export const collabGroupsRelations = relations(
  collabGroupsTable,
  ({ many }) => ({
    members: many(collabGroupMembersTable),
  })
);

export const collabGroupMembersRelations = relations(
  collabGroupMembersTable,
  ({ one }) => ({
    group: one(collabGroupsTable, {
      fields: [collabGroupMembersTable.group_id],
      references: [collabGroupsTable.id],
    }),
  })
);
