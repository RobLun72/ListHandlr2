import { db } from "@/db/index";
import { eq, inArray } from "drizzle-orm";
import {
  listsTable,
  listsCollaborationsTable,
  listItemsTable,
} from "@/db/schema";
import type { AllListRecord, IlistsDbQueries } from "./listsDbInterfaces";
import { sortAscending } from "@/Helpers/sortAndFilter";
import { ListData } from "@/DTO/listsData";

export class ListsRealDbQueries implements IlistsDbQueries {
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
}
