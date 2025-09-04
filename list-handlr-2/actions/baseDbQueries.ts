import { db } from "@/db/index";
import { eq, inArray } from "drizzle-orm";
import {
  listsTable,
  listsCollaborationsTable,
  listItemsTable,
} from "@/db/schema";
import { sortAscending } from "@/Helpers/sortAndFilter";

export const getAllListsForUser = async (userId: string) => {
  // Implementation for fetching all lists for a specific user
  const myLists = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.user_id, userId));
  const collabLists = await db
    .select()
    .from(listsCollaborationsTable)
    .where(eq(listsCollaborationsTable.user_id, userId));

  const myCollabLists =
    collabLists.length > 0
      ? await db
          .select()
          .from(listsTable)
          .where(
            inArray(
              listsTable.id,
              collabLists.map((c) => c.list_id)
            )
          )
      : [];
  const unsortedAllLists = [...myLists, ...myCollabLists];
  const allLists = sortAscending(unsortedAllLists, "index");

  return allLists;
};

export interface NamedListRecord {
  id: number;
  index: number;
  list_name: string;
  last_update: Date;
  last_item_update: Date;
  user_id: string | null;
}

export interface NamedListItem {
  id: number;
  list_id: number;
  index: number;
  text: string;
  done: string;
  link: string;
}

export interface NamedListCollab {
  id: number;
  list_id: number;
  user_id: string;
}

export interface NamedListResponse {
  namedList: NamedListRecord;
  listItems: NamedListItem[];
}

export interface NamedListCollabResponse {
  namedList: NamedListRecord;
  listItems: NamedListCollab[];
}

export const getListDataForNamedList = async (
  listName: string
): Promise<NamedListResponse> => {
  const namedList = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.list_name, listName));

  const listItems = await db
    .select()
    .from(listItemsTable)
    .where(eq(listItemsTable.list_id, namedList[0]?.id))
    .orderBy(listItemsTable.index);

  return {
    namedList: namedList[0],
    listItems: listItems,
  };
};

export const getCollabDataForNamedList = async (
  listName: string
): Promise<NamedListCollabResponse> => {
  const namedList = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.list_name, listName));

  const listItems = await db
    .select()
    .from(listsCollaborationsTable)
    .where(eq(listsCollaborationsTable.list_id, namedList[0]?.id))
    .orderBy(listsCollaborationsTable.user_id);

  return {
    namedList: namedList[0],
    listItems: listItems,
  };
};
