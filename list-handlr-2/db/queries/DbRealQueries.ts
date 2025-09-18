import { db } from "@/db/index";
import { eq, inArray } from "drizzle-orm";
import {
  listsTable,
  listsCollaborationsTable,
  listItemsTable,
} from "@/db/schema";
import type { AllListRecord, DbQueriesInterface } from "./DbInterfaces";
import { sortAscending } from "@/Helpers/sortAndFilter";
import { ListData } from "@/DTO/listsData";
import { NamedListData } from "@/DTO/oneListData";

export class RealDbQueries implements DbQueriesInterface {
  // all lists related
  async getAllListsForUser(userId: string): Promise<AllListRecord[]> {
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
  }
  async addListToDb(item: ListData, userId: string): Promise<void> {
    await db.insert(listsTable).values({
      index: item.index,
      list_name: item.listName!,
      last_update: new Date(),
      last_item_update: new Date(),
      user_id: userId,
    });
  }
  async editListToDb(item: ListData): Promise<void> {
    await db
      .update(listsTable)
      .set({
        index: item.index,
        list_name: item.listName,
        last_update: new Date(),
      })
      .where(eq(listsTable.id, item.id));
  }
  async deleteListToDb(item: ListData): Promise<void> {
    await db.delete(listItemsTable).where(eq(listItemsTable.list_id, item.id));

    await db
      .delete(listsCollaborationsTable)
      .where(eq(listsCollaborationsTable.list_id, item.id));

    await db.delete(listsTable).where(eq(listsTable.id, item.id));
  }
  // one list related
  async getListDataForNamedList(listName: string) {
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
  }
  async addListItemToDb(row: NamedListData, listId: number): Promise<void> {
    await db.insert(listItemsTable).values({
      list_id: listId,
      index: row.index,
      text: row.text,
      done: row.done ? "true" : "false",
      link: row.link,
    });
  }
  async editListItemToDb(row: NamedListData, listId: number): Promise<void> {
    await db
      .update(listItemsTable)
      .set({
        list_id: listId,
        index: row.index,
        text: row.text,
        done: row.done ? "true" : "false",
        link: row.link,
      })
      .where(eq(listItemsTable.id, row.id));
  }
  async deleteListItemToDb(row: NamedListData): Promise<void> {
    await db.delete(listItemsTable).where(eq(listItemsTable.id, row.id));
  }
  async editListLastUpdatedToDb(listId: number): Promise<void> {
    await db
      .update(listsTable)
      .set({ last_item_update: new Date() })
      .where(eq(listsTable.id, listId));
  }
  // collaboration related
  async getCollabDataForNamedList(listName: string) {
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
  }
  async deleteCollabsToDb(list_id: number): Promise<void> {
    await db
      .delete(listsCollaborationsTable)
      .where(eq(listsCollaborationsTable.list_id, list_id));
  }
  async addCollabItemToDb(userId: string, listId: number): Promise<void> {
    await db.insert(listsCollaborationsTable).values({
      list_id: listId,
      user_id: userId,
    });
  }
  async editCollabListLastUpdatedToDb(listId: number): Promise<void> {
    await db
      .update(listsTable)
      .set({ last_item_update: new Date() })
      .where(eq(listsTable.id, listId));
  }
}
